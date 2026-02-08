// src/modules/appointment/appointment.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AppointmentRepository } from 'src/db/repositories/appointment.repository';
import { DoctorRepository } from 'src/db/repositories/doctor.repository';
import { PatientRepository } from 'src/db/repositories/patient.repository';
import { ScheduleRepository } from 'src/db/repositories/schedule.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto'
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto"
import { CompleteAppointmentDto } from "./dto/complete-appointment.dto"
import { AppointmentFiltersDto } from "./dto/appointment-filters.dto"
import { AppointmentStatusEnum } from 'src/common';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorRepository: DoctorRepository,
    private readonly patientRepository: PatientRepository,
    private readonly scheduleRepository: ScheduleRepository,
  ) { }

  /**
   * Create new appointment (Patient books appointment)
   */
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
  ) {
    // Get patient
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Validate doctor exists
    if (!Types.ObjectId.isValid(createAppointmentDto.doctorId)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { _id: new Types.ObjectId(createAppointmentDto.doctorId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isAcceptingNewPatients) {
      throw new BadRequestException('Doctor is not accepting new patients');
    }

    // Validate clinic if provided
    if (createAppointmentDto.clinicId) {
      if (!Types.ObjectId.isValid(createAppointmentDto.clinicId)) {
        throw new BadRequestException('Invalid clinic ID');
      }
    }

    // Check if slot is available
    const scheduledDate = new Date(createAppointmentDto.scheduledDate);
    const isAvailable = await this.checkSlotAvailability(
      new Types.ObjectId(createAppointmentDto.doctorId),
      scheduledDate,
    );

    if (!isAvailable) {
      throw new ConflictException('This time slot is not available');
    }

    // Calculate fees if not provided
    let fees = createAppointmentDto.fees;
    if (!fees) {
      fees =
        createAppointmentDto.consultationMode === 'in_clinic'
          ? doctor.consultationFee?.inClinic || 0
          : createAppointmentDto.consultationMode === 'online'
            ? doctor.consultationFee?.online || 0
            : doctor.consultationFee?.homeVisit || 0;
    }

    // Create appointment
    const appointment = await this.appointmentRepository.create({
      data: [{

        ...createAppointmentDto,
        patientId: patient._id,
        doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
        clinicId: createAppointmentDto.clinicId
          ? new Types.ObjectId(createAppointmentDto.clinicId)
          : undefined,
        consultationFee: fees,
        status: AppointmentStatusEnum.pending,
        duration: createAppointmentDto.duration || 30,
        appointmentNumber: createAppointmentDto.appointmentNumber
      }]
    });

    return {
      message: 'Appointment created successfully',
      data: appointment,
    };
  }

  /**
   * Get my appointments (Patient)
   */
  async getMyAppointments(userId: string, filters: AppointmentFiltersDto) {
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.getAppointments({ ...filters, patientId: patient._id.toString() });
  }

  /**
   * Get doctor appointments (Doctor)
   */
  async getDoctorAppointments(userId: string, filters: AppointmentFiltersDto) {
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.getAppointments({ ...filters, doctorId: doctor._id.toString() });
  }

  /**
   * Get appointments with filters
   */
  async getAppointments(filters: AppointmentFiltersDto) {
    const {
      status,
      startDate,
      endDate,
      doctorId,
      patientId,
      page = 1,
      limit = 10,
      sortBy = 'scheduledDate',
      sortOrder = 'desc',
    } = filters;

    const query: any[] = [{ deletedAt: null }];

    // Status filter
    if (status) {
      query.push({ status });
    }

    // Date range filter
    if (startDate || endDate) {
      const dateQuery: any = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.push({ scheduledDate: dateQuery });
    }

    // Doctor filter
    if (doctorId) {
      query.push({ doctorId: new Types.ObjectId(doctorId) });
    }

    // Patient filter
    if (patientId) {
      query.push({ patientId: new Types.ObjectId(patientId) });
    }

    // const total = await this.appointmentRepository.countDocuments({
    //   filter: { $and: query },
    // });

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const appointments = await this.appointmentRepository.find({
      filter: { $and: query },
      options: {
        populate: [
          {
            path: 'patientId',
            populate: { path: 'userId', select: 'fullName phoneNumber email avatar' },
          },
          {
            path: 'doctorId',
            populate: { path: 'userId', select: 'fullName phoneNumber email avatar' },
          },
          { path: 'clinicId', select: 'name nameAr address phoneNumber' },
        ],
        skip: (page - 1) * limit,
        limit,
        sort,
        lean: true,
      },
    });

    return {
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          // total,
          page,
          limit,
          // totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId: string, userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId), deletedAt: null },
      options: {
        populate: [
          {
            path: 'patientId',
            populate: { path: 'userId', select: 'fullName phoneNumber email avatar' },
          },
          {
            path: 'doctorId',
            populate: { path: 'userId', select: 'fullName phoneNumber email avatar' },
          },
          { path: 'clinicId' },
        ],
      },
    });

    console.log({ appointment });
    console.log( appointment?._id );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization
    // const patient = await this.patientRepository.findOne({
    //   filter: { _id: new Types.ObjectId(userId) },
    // });

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    // console.log("patientid"+patient?._id);
    console.log("doctorid"+doctor?._id);
    

    console.log({ appointment });


    // const isPatientOwner = patient && appointment.patientId._id.toString() === patient._id.toString();
    const isDoctorOwner = doctor && appointment.doctorId._id.toString() === doctor._id.toString();

    if ( !isDoctorOwner) {
      throw new ForbiddenException('You are not authorized to view this appointment');
    }

    return {
      message: 'Appointment retrieved successfully',
      data: appointment,
    };
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    appointmentId: string,
    cancelDto: CancelAppointmentDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check if already cancelled or completed
    if (appointment.status === AppointmentStatusEnum.cancelled) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatusEnum.completed) {
      throw new BadRequestException('Cannot cancel completed appointment');
    }

    // Check authorization (patient or doctor can cancel)
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    const isPatientOwner = patient && appointment.patientId.toString() === patient._id.toString();
    const isDoctorOwner = doctor && appointment.doctorId.toString() === doctor._id.toString();

    if (!isPatientOwner && !isDoctorOwner) {
      throw new ForbiddenException('You are not authorized to cancel this appointment');
    }

    // Update appointment
    const updatedAppointment = await this.appointmentRepository.updateOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
      update: {
        $set: {
          status: AppointmentStatusEnum.cancelled,
          cancellationReason: cancelDto.reason,
          cancelledAt: new Date(),
        },
      },
      // options: { new: true },
    });

    return {
      message: 'Appointment cancelled successfully',
      data: updatedAppointment,
    };
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    rescheduleDto: RescheduleAppointmentDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check status
    if (appointment.status === AppointmentStatusEnum.cancelled) {
      throw new BadRequestException('Cannot reschedule cancelled appointment');
    }

    if (appointment.status === AppointmentStatusEnum.completed) {
      throw new BadRequestException('Cannot reschedule completed appointment');
    }

    // Check authorization (only patient can reschedule)
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      throw new ForbiddenException('Only the patient can reschedule the appointment');
    }

    // Check if new slot is available
    const newDate = new Date(rescheduleDto.newDate);
    const isAvailable = await this.checkSlotAvailability(
      appointment.doctorId,
      newDate,
      appointment._id,
    );

    if (!isAvailable) {
      throw new ConflictException('The new time slot is not available');
    }

    // Update appointment
    const updatedAppointment = await this.appointmentRepository.updateOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
      update: {
        $set: {
          scheduledDate: newDate,
          status: AppointmentStatusEnum.pending,
        },
      },
      // options: { new: true },
    });

    return {
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment,
    };
  }

  /**
   * Confirm appointment (Doctor)
   */
  async confirmAppointment(appointmentId: string, userId: string) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization (only doctor)
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('Only the doctor can confirm the appointment');
    }

    if (appointment.status !== AppointmentStatusEnum.pending) {
      throw new BadRequestException('Only pending appointments can be confirmed');
    }

    const updatedAppointment = await this.appointmentRepository.updateOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
      update: { $set: { status: AppointmentStatusEnum.confirmed } },
      // options: { new: true },
    });

    return {
      message: 'Appointment confirmed successfully',
      data: updatedAppointment,
    };
  }

  /**
   * Complete appointment (Doctor)
   */
  async completeAppointment(
    appointmentId: string,
    completeDto: CompleteAppointmentDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization (only doctor)
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('Only the doctor can complete the appointment');
    }

    if (appointment.status === AppointmentStatusEnum.completed) {
      throw new BadRequestException('Appointment is already completed');
    }

    if (appointment.status === AppointmentStatusEnum.cancelled) {
      throw new BadRequestException('Cannot complete cancelled appointment');
    }

    const updatedAppointment = await this.appointmentRepository.updateOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
      update: {
        $set: {
          status: AppointmentStatusEnum.completed,
          diagnosis: completeDto.diagnosis,
          treatmentPlan: completeDto.treatmentPlan,
          prescription: completeDto.prescription,
          notes: completeDto.notes,
          isFollowUpRequired: completeDto.isFollowUpRequired,
          followUpDate: completeDto.followUpDate,
          completedAt: new Date(),
        },
      },
      // options: { new: true },
    });

    return {
      message: 'Appointment completed successfully',
      data: updatedAppointment,
    };
  }

  /**
   * Mark as no-show (Doctor)
   */
  async markNoShow(appointmentId: string, userId: string) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentRepository.findOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization (only doctor)
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('Only the doctor can mark appointment as no-show');
    }

    const updatedAppointment = await this.appointmentRepository.updateOne({
      filter: { _id: new Types.ObjectId(appointmentId) },
      update: { $set: { status: AppointmentStatusEnum.noShow } },
      // options: { new: true },
    });

    return {
      message: 'Appointment marked as no-show',
      data: updatedAppointment,
    };
  }

  /**
   * Check if time slot is available
   */
  private async checkSlotAvailability(
    doctorId: Types.ObjectId,
    scheduledDate: Date,
    excludeAppointmentId?: Types.ObjectId,
  ): Promise<boolean> {
    const query: any = {
      doctorId,
      scheduledDate: {
        $gte: new Date(scheduledDate.setMinutes(0, 0, 0)),
        $lt: new Date(scheduledDate.setHours(scheduledDate.getHours() + 1)),
      },
      status: { $in: [AppointmentStatusEnum.pending, AppointmentStatusEnum.confirmed] },
      deletedAt: null,
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const existingAppointment = await this.appointmentRepository.findOne({
      filter: query,
    });

    return !existingAppointment;
  }
}