// src/modules/schedule/schedule.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ScheduleRepository } from 'src/db/repositories/schedule.repository';
import { AppointmentRepository } from 'src/db/repositories/appointment.repository';
import { DoctorRepository } from 'src/db/repositories/doctor.repository';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddExceptionDto } from "./dto/add-exception.dto"
import { GetAvailableSlotsDto } from "./dto/get-available-slots.dto"
import { ITimeSlot, ScheduleStatusEnum } from 'src/common';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorRepository: DoctorRepository,
  ) { }


  async create(createScheduleDto: CreateScheduleDto, userId: string) {

    // Get doctor profile
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Validate clinic if provided
    if (createScheduleDto.clinicId) {
      if (!Types.ObjectId.isValid(createScheduleDto.clinicId)) {
        throw new BadRequestException('Invalid clinic ID');
      }
    }

    // Validate time range
    if (createScheduleDto.isRecurring && createScheduleDto.workingHours) {
      this.validateWorkingHours(createScheduleDto.workingHours);
    }

    if (!createScheduleDto.isRecurring && createScheduleDto.specificDateWorkingHours) {
      this.validateWorkingHours(createScheduleDto.specificDateWorkingHours);
    }

    const schedule = await this.scheduleRepository.create({
      data: [{
        ...createScheduleDto,
        doctorId: doctor._id,
        clinicId: createScheduleDto.clinicId
          ? new Types.ObjectId(createScheduleDto.clinicId)
          : undefined,
        status: ScheduleStatusEnum.active,
      }]
    });

    return {
      message: 'Schedule created successfully',
      data: schedule,
    };
  }


  async getMySchedules(userId: string) {
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const schedules = await this.scheduleRepository.find({
      filter: { doctorId: doctor._id, deletedAt: null },
      options: {
        populate: [{ path: 'clinicId', select: 'name nameAr address' }],
        sort: { isRecurring: -1, dayOfWeek: 1 },
      },
    });

    return {
      message: 'Schedules retrieved successfully',
      data: schedules,
    };
  }


  async getScheduleById(scheduleId: Types.ObjectId, userId?: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const schedule = await this.scheduleRepository.findOne({
      filter: { _id: scheduleId, deletedAt: null },
      options: {
        populate: [
          { path: 'doctorId', populate: { path: 'userId', select: 'fullName' } },
          { path: 'clinicId', select: 'name nameAr address' },
        ],
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // If userId provided, check ownership
    if (userId) {
      const doctor = await this.doctorRepository.findOne({
        filter: { userId: new Types.ObjectId(userId) },
      });

      console.log({ schedule });


      console.log("doctorId" + schedule.doctorId);
      console.log("id" + doctor?._id);



      if (!doctor || schedule.doctorId !== doctor._id) {
        throw new ForbiddenException('You are not authorized to view this schedule');
      }
    }

    return {
      message: 'Schedule retrieved successfully',
      data: schedule,
    };
  }


  async updateSchedule(
    scheduleId: string,
    updateScheduleDto: UpdateScheduleDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check ownership
    if (schedule.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('You are not authorized to update this schedule');
    }

    // Validate working hours if provided
    if (updateScheduleDto.workingHours) {
      this.validateWorkingHours(updateScheduleDto.workingHours);
    }

    if (updateScheduleDto.specificDateWorkingHours) {
      this.validateWorkingHours(updateScheduleDto.specificDateWorkingHours);
    }

    const updatedSchedule = await this.scheduleRepository.updateOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
      update: { $set: updateScheduleDto },
      // options: { new: true },
    });

    return {
      message: 'Schedule updated successfully',
      data: updatedSchedule,
    };
  }


  async deleteSchedule(scheduleId: string, userId: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check ownership
    if (schedule.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('You are not authorized to delete this schedule');
    }

    await this.scheduleRepository.updateOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
      update: { $set: { deletedAt: new Date(), status: 'inactive' } },
    });

    return {
      message: 'Schedule deleted successfully',
    };
  }


  async addException(
    scheduleId: string,
    addExceptionDto: AddExceptionDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check ownership
    if (schedule.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('You are not authorized to update this schedule');
    }

    // Validate custom working hours if provided
    if (addExceptionDto.customWorkingHours) {
      this.validateWorkingHours(addExceptionDto.customWorkingHours);
    }

    // Check if exception already exists for this date
    const existingExceptionIndex = schedule.exceptions?.findIndex(
      (ex) =>
        new Date(ex.date).toDateString() ===
        new Date(addExceptionDto.date).toDateString(),
    );

    if (existingExceptionIndex !== undefined && existingExceptionIndex >= 0) {
      // Update existing exception
      await this.scheduleRepository.updateOne({
        filter: { _id: new Types.ObjectId(scheduleId) },
        update: {
          $set: {
            [`exceptions.${existingExceptionIndex}`]: addExceptionDto,
          },
        },
      });
    } else {
      // Add new exception
      await this.scheduleRepository.updateOne({
        filter: { _id: new Types.ObjectId(scheduleId) },
        update: { $push: { exceptions: addExceptionDto } },
      });
    }

    const updatedSchedule = await this.scheduleRepository.findOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
    });

    return {
      message: 'Exception added successfully',
      data: updatedSchedule,
    };
  }


  async removeException(scheduleId: string, exceptionDate: string, userId: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid schedule ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check ownership
    if (schedule.doctorId.toString() !== doctor._id.toString()) {
      throw new ForbiddenException('You are not authorized to update this schedule');
    }

    await this.scheduleRepository.updateOne({
      filter: { _id: new Types.ObjectId(scheduleId) },
      update: {
        $pull: {
          exceptions: {
            date: new Date(exceptionDate),
          },
        },
      },
    });

    return {
      message: 'Exception removed successfully',
    };
  }


  async getAvailableSlots(
    doctorUserId: string,
    getAvailableSlotsDto: GetAvailableSlotsDto,
  ) {
    const { date, consultationMode } = getAvailableSlotsDto;

    // Get doctor
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(doctorUserId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Find applicable schedule
    let schedule;

    // First, check for specific date schedule
    schedule = await this.scheduleRepository.findOne({
      filter: {
        doctorId: doctor._id,
        isRecurring: false,
        specificDate: {
          $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
        },
        status: 'active',
        deletedAt: null,
      },
    });

    // If no specific date schedule, look for recurring schedule
    if (!schedule) {
      const query: any = {
        doctorId: doctor._id,
        isRecurring: true,
        dayOfWeek,
        status: 'active',
        deletedAt: null,
      };

      if (consultationMode) {
        query.consultationMode = consultationMode;
      }

      schedule = await this.scheduleRepository.findOne({
        filter: query,
      });
    }

    if (!schedule) {
      return {
        message: 'No schedule found for this date',
        data: {
          date,
          slots: [],
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
        },
      };
    }

    // Check for exceptions
    const exception = schedule.exceptions?.find(
      (ex) =>
        new Date(ex.date).toDateString() === new Date(date).toDateString(),
    );

    if (exception && !exception.isAvailable) {
      return {
        message: `Doctor is not available on this date. Reason: ${exception.reason}`,
        data: {
          date,
          slots: [],
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
        },
      };
    }

    // Get working hours (from exception or normal schedule)
    let workingHours;
    if (exception?.customWorkingHours) {
      workingHours = exception.customWorkingHours;
    } else if (schedule.isRecurring) {
      workingHours = schedule.workingHours;
    } else {
      workingHours = schedule.specificDateWorkingHours;
    }

    if (!workingHours) {
      throw new BadRequestException('Working hours not found for this schedule');
    }

    // Generate time slots
    const allSlots = this.generateTimeSlots(
      date,
      workingHours,
      schedule.slotDuration,
      schedule.bufferTime || 0,
    );

    // Get booked appointments for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.appointmentRepository.find({
      filter: {
        doctorId: doctor._id,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $in: ['pending', 'confirmed'] },
        deletedAt: null,
      },
    });

    // Mark slots as booked
    const slots = allSlots.map((slot) => {
      const slotTime = new Date(slot.startTime);
      const now = new Date();

      // Check if slot is in the past
      const isPast = slotTime < now;

      // Check if slot is booked
      const isBooked = bookedAppointments.some((appointment: any) => {
        const appointmentTime = new Date(appointment.scheduledDate);
        return appointmentTime.getTime() === slotTime.getTime();
      });

      return {
        ...slot,
        isAvailable: !isPast && !isBooked,
        isBooked,
        isPast,
      };
    });

    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.isAvailable).length;
    const bookedSlots = slots.filter((s) => s.isBooked).length;

    return {
      message: 'Available slots retrieved successfully',
      data: {
        date,
        slots,
        totalSlots,
        availableSlots,
        bookedSlots,
      },
    };
  }


  private generateTimeSlots(
    date: string,
    workingHours: any,
    slotDuration: number,
    bufferTime: number,
  ): ITimeSlot[] {
    const slots: ITimeSlot[] = [];
    const dateObj = new Date(date);

    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    let currentTime = new Date(dateObj);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(dateObj);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Break times
    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;

    if (workingHours.breakStartTime && workingHours.breakEndTime) {
      const [breakStartHour, breakStartMinute] = workingHours.breakStartTime
        .split(':')
        .map(Number);
      const [breakEndHour, breakEndMinute] = workingHours.breakEndTime
        .split(':')
        .map(Number);

      breakStart = new Date(dateObj);
      breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);

      breakEnd = new Date(dateObj);
      breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
    }

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Skip if slot is during break time
      if (breakStart && breakEnd) {
        if (
          currentTime >= breakStart &&
          currentTime < breakEnd
        ) {
          currentTime = new Date(breakEnd);
          continue;
        }
      }

      // Don't add slot if it goes beyond working hours
      if (slotEnd <= endTime) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: slotEnd,
          isAvailable: true,
        });
      }

      // Move to next slot (duration + buffer)
      currentTime = new Date(currentTime.getTime() + (slotDuration + bufferTime) * 60000);
    }

    return slots;
  }


  private validateWorkingHours(workingHours: any): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(workingHours.startTime)) {
      throw new BadRequestException('Invalid start time format. Use HH:MM');
    }

    if (!timeRegex.test(workingHours.endTime)) {
      throw new BadRequestException('Invalid end time format. Use HH:MM');
    }

    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate break times if provided
    if (workingHours.breakStartTime && workingHours.breakEndTime) {
      if (!timeRegex.test(workingHours.breakStartTime)) {
        throw new BadRequestException('Invalid break start time format. Use HH:MM');
      }

      if (!timeRegex.test(workingHours.breakEndTime)) {
        throw new BadRequestException('Invalid break end time format. Use HH:MM');
      }

      const [breakStartHour, breakStartMinute] = workingHours.breakStartTime
        .split(':')
        .map(Number);
      const [breakEndHour, breakEndMinute] = workingHours.breakEndTime
        .split(':')
        .map(Number);

      const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

      if (breakEndMinutes <= breakStartMinutes) {
        throw new BadRequestException('Break end time must be after break start time');
      }

      if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
        throw new BadRequestException('Break time must be within working hours');
      }
    }
  }
}