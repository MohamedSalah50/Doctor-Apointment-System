// src/modules/doctor/doctor.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { DoctorRepository } from 'src/db/repositories/doctor.repository';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorSearchFiltersDto } from './dto/doctor-search-filters.dto';
import { DoctorStatusEnum, IDoctorPublicProfile } from 'src/common';

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository
  ) { }

  async getAllDoctors(filters: DoctorSearchFiltersDto) {
    const {
      specialty,
      minRating,
      isVerified,
      isAcceptingNewPatients,
      minFee,
      maxFee,
      search,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = filters;

    const query: any[] = [{ deletedAt: null }];

    // Specialty filter
    if (specialty) {
      query.push({ specialty });
    }

    // Rating filter
    if (minRating) {
      query.push({ rating: { $gte: minRating } });
    }

    // Verified filter
    if (isVerified !== undefined) {
      query.push({ isVerified });
    }

    // Accepting new patients filter
    if (isAcceptingNewPatients !== undefined) {
      query.push({ isAcceptingNewPatients });
    }

    // Fee range filter
    if (minFee || maxFee) {
      const feeQuery: any = {};
      if (minFee) feeQuery.$gte = minFee;
      if (maxFee) feeQuery.$lte = maxFee;
      query.push({ 'consultationFee.inClinic': feeQuery });
    }

    // Search filter (name or bio)
    if (search) {
      query.push({
        $or: [
          { bio: { $regex: search, $options: 'i' } },
          { about: { $regex: search, $options: 'i' } },
        ],
      });
    }
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const doctors = await this.doctorRepository.find({
      filter: { $and: query },
      options: {
        populate: [
          { path: 'userId', select: 'fullName avatar phoneNumber' },
          { path: 'clinics', select: 'name nameAr address phoneNumber' },
        ],
        skip: (page - 1) * limit,
        limit,
        sort,
        lean: true,
      },
    });

    // Transform to public profile
    const publicProfiles = doctors.map((doctor: any) =>
      this.transformToPublicProfile(doctor),
    );

    return {
      message: 'Doctors retrieved successfully',
      data: {
        doctors: publicProfiles,
        pagination: {
          // total,
          page,
          limit,
          // totalPages: Math.ceil(total / limit),
        },
      },
    };
  }


  async getDoctorById(doctorId: string) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { _id: new Types.ObjectId(doctorId), deletedAt: null },
      options: {
        populate: [
          { path: 'userId', select: 'fullName avatar phoneNumber email gender' },
          { path: 'clinics', select: 'name nameAr address phoneNumber location' },
        ],
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const publicProfile = this.transformToPublicProfile(doctor);

    return {
      message: 'Doctor retrieved successfully',
      data: publicProfile,
    };
  }


  async getMyProfile(userId: string) {
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
      options: {
        populate: [
          { path: 'userId', select: '-password' },
          { path: 'clinics' },
        ],
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return {
      message: 'Doctor profile retrieved successfully',
      data: doctor,
    };
  }


  async updateMyProfile(userId: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const updatedDoctor = await this.doctorRepository.updateOne({
      filter: { _id: doctor._id },
      update: { $set: updateDoctorDto },
      // options: { new },
    });

    return {
      message: 'Doctor profile updated successfully',
      data: updatedDoctor,
    };
  }


  async getMyStats(userId: Types.ObjectId) {
    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return {
      message: 'Doctor stats retrieved successfully',
      data: {
        totalPatients: doctor.totalPatients || 0,
        totalAppointments: doctor.totalAppointments || 0,
        rating: doctor.rating || 0,
        totalReviews: doctor.totalReviews || 0,
        isVerified: doctor.isVerified,
        isAcceptingNewPatients: doctor.isAcceptingNewPatients,
      },
    };
  }


  async searchDoctors(searchTerm: string, filters: DoctorSearchFiltersDto) {
    return this.getAllDoctors({ ...filters, search: searchTerm });
  }

  async getTopRatedDoctors(limit: number = 10) {
    const doctors = await this.doctorRepository.find({
      filter: { deletedAt: null, isVerified: true, rating: { $gte: 4 } },
      options: {
        populate: [
          { path: 'userId', select: 'fullName avatar' },
          { path: 'clinics', select: 'name address' },
        ],
        limit,
        sort: { rating: -1, totalReviews: -1 },
        lean: true,
      },
    });

    const publicProfiles = doctors.map((doctor: any) =>
      this.transformToPublicProfile(doctor),
    );

    return {
      message: 'Top-rated doctors retrieved successfully',
      data: publicProfiles,
    };
  }


  async getDoctorsBySpecialty(specialty: string, filters: DoctorSearchFiltersDto) {
    return this.getAllDoctors({ ...filters, specialty: specialty as any });
  }


  async createProfile(userId: Types.ObjectId, data: any) {
    const existingDoctor = await this.doctorRepository.findOne({
      filter: { userId },
    });

    if (existingDoctor) {
      throw new BadRequestException('Doctor profile already exists');
    }

    const doctor = await this.doctorRepository.create({
      data: [{
        userId,
        specialty: data.specialty,
        degree: data.degree,
        licenseNumber: data.licenseNumber,
        yearsOfExperience: data.yearsOfExperience || 0,
        consultationModes: data.consultationModes || ['in_clinic'],
        consultationFee: data.consultationFee || {
          inClinic: 0,
          online: 0,
        },
        sessionDuration: data.sessionDuration || 30,
        status: DoctorStatusEnum.available,
        isAcceptingNewPatients: false,
        isVerified: false,
      }]
    });

    return doctor;
  }


  async addClinic(userId: string, clinicId: string) {
    if (!Types.ObjectId.isValid(clinicId)) {
      throw new BadRequestException('Invalid clinic ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    await this.doctorRepository.updateOne({
      filter: { _id: doctor._id },
      update: { $addToSet: { clinics: new Types.ObjectId(clinicId) } },
    });

    return {
      message: 'Clinic added successfully',
    };
  }

  async removeClinic(userId: string, clinicId: string) {
    if (!Types.ObjectId.isValid(clinicId)) {
      throw new BadRequestException('Invalid clinic ID');
    }

    const doctor = await this.doctorRepository.findOne({
      filter: { userId: new Types.ObjectId(userId) },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    await this.doctorRepository.updateOne({
      filter: { _id: doctor._id },
      update: { $pull: { clinics: new Types.ObjectId(clinicId) } },
    });

    return {
      message: 'Clinic removed successfully',
    };
  }


  private transformToPublicProfile(doctor: any): IDoctorPublicProfile {
    const userData = doctor.userId || {};
    const clinicsData = doctor.clinics || [];

    return {
      _id: doctor._id,
      fullName: userData.fullName || '',
      avatar: userData.avatar,
      specialty: doctor.specialty,
      subSpecialties: doctor.subSpecialties,
      degree: doctor.degree,
      yearsOfExperience: doctor.yearsOfExperience,
      bio: doctor.bio,
      about: doctor.about,
      languages: doctor.languages,
      consultationModes: doctor.consultationModes,
      consultationFee: {
        inClinic: doctor.consultationFee?.inClinic,
        online: doctor.consultationFee?.online,
        homeVisit: doctor.consultationFee?.homeVisit,
      },
      sessionDuration: doctor.sessionDuration,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
      isAcceptingNewPatients: doctor.isAcceptingNewPatients,
      isVerified: doctor.isVerified,
      clinics: clinicsData.map((clinic: any) => ({
        _id: clinic._id,
        name: clinic.name || clinic.nameAr,
        address: clinic.address
          ? `${clinic.address.street}, ${clinic.address.city}, ${clinic.address.state}`
          : '',
      })),
    };
  }
}