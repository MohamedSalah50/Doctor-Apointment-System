// src/modules/patient/patient.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from 'src/db/models/patient.model';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdateMedicalInfoDto } from './dto/update-medical-info.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { PatientRepository } from 'src/db';

@Injectable()
export class PatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
  ) { }

  /**
   * Get patient profile by userId
   */
  async getMyProfile(userId: Types.ObjectId) {
    const patient = await this.patientRepository
      .findOne({ filter: { userId: new Types.ObjectId(userId) }, options: { populate: [{ path: 'userId' }] } })

    if (!patient) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    return {
      message: 'تم جلب البيانات بنجاح',
      data: patient,
    };
  }

  /**
   * Update patient profile
   */
  async updateMyProfile(userId: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    // Update fields
    Object.assign(patient, updatePatientDto);
    await patient.save();

    return {
      message: 'تم تحديث البيانات بنجاح',
      data: patient,
    };
  }

  /**
   * Update medical information
   */
  async updateMedicalInfo(userId: string, updateMedicalInfoDto: UpdateMedicalInfoDto) {
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    // Update medical fields
    if (updateMedicalInfoDto.bloodType) {
      patient.bloodType = updateMedicalInfoDto.bloodType;
    }
    if (updateMedicalInfoDto.allergies) {
      patient.allergies = updateMedicalInfoDto.allergies;
    }
    if (updateMedicalInfoDto.chronicDiseases) {
      patient.chronicDiseases = updateMedicalInfoDto.chronicDiseases;
    }
    if (updateMedicalInfoDto.height) {
      patient.height = updateMedicalInfoDto.height;
    }
    if (updateMedicalInfoDto.weight) {
      patient.weight = updateMedicalInfoDto.weight;
    }

    await patient.save();

    return {
      message: 'تم تحديث المعلومات الطبية بنجاح',
      data: patient,
    };
  }

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(
    userId: string,
    updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    patient.emergencyContact = updateEmergencyContactDto;
    await patient.save();

    return {
      message: 'تم تحديث جهة الاتصال الطارئة بنجاح',
      data: patient,
    };
  }

  /**
   * Get medical summary
   */
  async getMedicalSummary(userId: string) {
    const patient = await this.patientRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!patient) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    // Calculate BMI if height and weight are available
    let bmi: number | null = null;
    if (patient.height && patient.weight) {
      const heightInMeters = patient.height / 100;
      bmi = Number((patient.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    return {
      message: 'تم جلب الملخص الطبي بنجاح',
      data: {
        patientId: patient._id,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
        chronicDiseases: patient.chronicDiseases || [],
        height: patient.height,
        weight: patient.weight,
        bmi,
      },
    };
  }

  /**
   * Create patient profile (called during signup)
   */
  async createProfile(userId: Types.ObjectId, data?: Partial<Patient>) {
    const existingPatient = await this.patientRepository.findOne({ filter: { userId } });

    if (existingPatient) {
      throw new BadRequestException('الملف الشخصي موجود بالفعل');
    }

    const patient = await this.patientRepository.create({
      data: [{
        userId,
        preferredLanguage: 'ar',
        notificationPreferences: {
          email: true,
          sms: true,
          push: true,
        },
        ...data,
      }]
    });

    return patient;
  }
}