// src/modules/clinic/clinic.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicSearchDto } from './dto/search-clinic.dto';
// import { NearbyClinicsDto } from './dto/nearby-clinics.dto';
import { ClinicRepository } from 'src/db';

@Injectable()
export class ClinicService {
  constructor(
    private readonly clinicRepository: ClinicRepository,
  ) { }


  async create(createClinicDto: CreateClinicDto, userId: string) {

    const existingClinic = await this.clinicRepository.findOne({ filter: { name: createClinicDto.name } });

    if (existingClinic) {
      throw new ConflictException('clinic is already exist');
    }

    const clinic = await this.clinicRepository.create({
      data: [{
        ...createClinicDto,
        ownerId: new Types.ObjectId(userId),
        isActive: true,
        isVerified: false,
      }]
    });

    return {
      message: 'تم إضافة العيادة بنجاح',
      data: clinic,
    };
  }


  async findAll(filters: ClinicSearchDto) {
    const { city, search, page = 1, limit = 10 } = filters;

    const query: any = { isActive: true };

    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Search filter (name or description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameAr: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { descriptionAr: { $regex: search, $options: 'i' } },
      ];
    }

    // const total = await this.clinicRepository.countDocuments(query);
    const clinics = await this.clinicRepository
      .find({
        filter: { $and: [query] },
        options: {
          populate: [{ path: 'doctors', select: 'fullName specialty rating avatar' }],
          skip: (page - 1) * limit, limit, lean: true
        }
      })

    return {
      message: 'تم جلب البيانات بنجاح',
      data: {
        clinics,
        pagination: {
          // total,
          page,
          limit,
          // totalPages: Math.ceil(total / limit),
        },
      },
    };
  }


  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف العيادة غير صحيح');
    }

    const clinic = await this.clinicRepository.findOne({
      filter: { _id: id },
      options: {
        populate: [{ path: 'doctors', select: 'fullName specialty rating avatar' }],
      }
    });

    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    return {
      message: 'تم جلب البيانات بنجاح',
      data: clinic,
    };
  }


  // async findNearby(nearbyClinicsDto: NearbyClinicsDto) {
  //   const { lng, lat, maxDistance } = nearbyClinicsDto;

  //   const clinics = await this.clinicRepository.find({
  //     location: {
  //       $near: {
  //         $geometry: {
  //           type: 'Point',
  //           coordinates: [lng, lat],
  //         },
  //         $maxDistance: maxDistance,
  //       },
  //     },
  //     isActive: true,
  //   }).limit(20);

  //   // Calculate distance for each clinic
  //   const clinicsWithDistance = clinics.map((clinic) => {
  //     let distance = null;
  //     if (clinic.location?.coordinates) {
  //       const [clinicLng, clinicLat] = clinic.location.coordinates;
  //       // Haversine formula for distance
  //       distance = this.calculateDistance(lat, lng, clinicLat, clinicLng);
  //     }

  //     return {
  //       ...clinic.toObject(),
  //       distance: distance ? Math.round(distance * 100) / 100 : null, // Round to 2 decimals
  //     };
  //   });

  //   return {
  //     message: 'تم جلب العيادات القريبة بنجاح',
  //     data: clinicsWithDistance,
  //   };
  // }


  async getClinicDoctors(clinicId: string) {
    if (!Types.ObjectId.isValid(clinicId)) {
      throw new BadRequestException('معرف العيادة غير صحيح');
    }

    const clinic = await this.clinicRepository.findOne({
      filter: { _id: clinicId },
      options: {
        populate: [{ path: 'doctors', select: 'specialty rating avatar', populate: [{ path: 'userId', select: 'fullName' }] }],
      }
    })

    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    return {
      message: 'تم جلب الأطباء بنجاح',
      data: clinic.doctors,
    };
  }

  async update(id: string, updateClinicDto: UpdateClinicDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف العيادة غير صحيح');
    }
    const clinic = await this.clinicRepository.findOne({ filter: { _id: id } });


    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    if (updateClinicDto.name) {
      const existingClinic = await this.clinicRepository.findOne({ filter: { name: updateClinicDto.name } });
      if (existingClinic && existingClinic._id.toString() !== id) {
        throw new BadRequestException("clinic name already exists");
      }
    }

    // Check ownership
    if (clinic.ownerId?.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل هذه العيادة');
    }

    Object.assign(clinic, updateClinicDto);
    await clinic.save();

    return {
      message: 'تم تحديث العيادة بنجاح',
      data: clinic,
    };
  }


  async softDelete(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف العيادة غير صحيح');
    }

    const clinic = await this.clinicRepository.findOne({ filter: { _id: id } });

    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    // Check ownership
    if (clinic.ownerId?.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس لديك صلاحية لحذف هذه العيادة');
    }

    await this.clinicRepository.updateOne({ filter: { _id: id }, update: { isActive: false } });

    return {
      message: 'تم حذف العيادة بنجاح',
    };
  }


  async addDoctor(clinicId: Types.ObjectId, doctorId: string, userId: string) {
    if (!Types.ObjectId.isValid(clinicId) || !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('المعرف غير صحيح');
    }

    const clinic = await this.clinicRepository.findOne({ filter: { _id: clinicId } });

    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    // Check ownership
    if (clinic.ownerId?.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس لديك صلاحية لإضافة أطباء لهذه العيادة');
    }

    await this.clinicRepository.updateOne({ filter: { _id: clinicId }, update: { $addToSet: { doctors: new Types.ObjectId(doctorId) } } });

    return {
      message: 'تم إضافة الطبيب للعيادة بنجاح',
      data: clinic,
    };
  }


  async removeDoctor(clinicId: string, doctorId: string, userId: string) {

    if (!Types.ObjectId.isValid(clinicId) || !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('المعرف غير صحيح');
    }

    const clinic = await this.clinicRepository.findOne({ filter: { _id: clinicId } });

    if (!clinic) {
      throw new NotFoundException('العيادة غير موجودة');
    }

    // Check ownership
    if (clinic.ownerId?.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس لديك صلاحية لإزالة أطباء من هذه العيادة');
    }

    await this.clinicRepository.updateOne({ filter: { _id: clinicId }, update: { $pull: { doctors: new Types.ObjectId(doctorId) } } });

    return {
      message: 'تم إزالة الطبيب من العيادة بنجاح',
      data: clinic,
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of Earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}