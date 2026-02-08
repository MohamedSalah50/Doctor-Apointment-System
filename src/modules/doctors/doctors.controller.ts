// src/modules/doctor/doctor.controller.ts

import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorSearchFiltersDto } from './dto/doctor-search-filters.dto';

import { type IAuthRequest, RoleEnum } from 'src/common';
import { DoctorService } from './doctors.service';
import { auth } from 'src/common/decorators/auth.decorator';
import { ScheduleService } from '../schedule/schedule.service';
import { GetAvailableSlotsDto } from '../schedule/dto/get-available-slots.dto';

@auth([RoleEnum.doctor])
@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly scheduleService: ScheduleService
  ) { }

  @Get()
  async getAllDoctors(@Query() filters: DoctorSearchFiltersDto) {
    return this.doctorService.getAllDoctors(filters);
  }

  @Get('top-rated')
  async getTopRatedDoctors(@Query('limit') limit?: number) {
    return this.doctorService.getTopRatedDoctors(limit || 10);
  }


  @Get('my-profile')
  async getMyProfile(@Request() req) {
    return this.doctorService.getMyProfile(req.user._id);
  }


  @Put('my-profile')
  async updateMyProfile(
    @Request() req,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.updateMyProfile(req.user._id, updateDoctorDto);
  }


  @Get('my-stats')
  async getMyStats(@Request() req) {
    return this.doctorService.getMyStats(req.user._id);
  }


  @Post('my-clinics/:clinicId')
  async addClinic(@Request() req, @Param('clinicId') clinicId: string) {
    return this.doctorService.addClinic(req.user._id, clinicId);
  }


  @Delete('my-clinics/:clinicId')
  async removeClinic(@Request() req, @Param('clinicId') clinicId: string) {
    return this.doctorService.removeClinic(req.user._id, clinicId);
  }


  @Get('search')
  async searchDoctors(
    @Query('q') searchTerm: string,
    @Query() filters: DoctorSearchFiltersDto,
  ) {
    return this.doctorService.searchDoctors(searchTerm, filters);
  }


  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorService.getDoctorById(id);
  }




  @Get(':doctorUserId/available-slots')
  async getAvailableSlots(
    @Param('doctorUserId') doctorUserId: string,
    @Query() getAvailableSlotsDto: GetAvailableSlotsDto,
  ) {
    return this.scheduleService.getAvailableSlots(
      doctorUserId,
      getAvailableSlotsDto,
    );
  }
}