// src/modules/clinic/clinic.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicSearchDto } from './dto/search-clinic.dto';
// import { NearbyClinicsDto } from './dto/nearby-clinics.dto';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { Types } from 'mongoose';

@Controller('clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) { }


  @auth([RoleEnum.doctor, RoleEnum.admin])
  @Post()
  async create(@Body() createClinicDto: CreateClinicDto, @Request() req) {
    return this.clinicService.create(createClinicDto, req.user._id);
  }


  @Get()
  async findAll(@Query() filters: ClinicSearchDto) {
    return this.clinicService.findAll(filters);
  }


  // @Get('nearby')
  // async findNearby(@Query() nearbyClinicsDto: NearbyClinicsDto) {
  //   return this.clinicService.findNearby(nearbyClinicsDto);
  // }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clinicService.findOne(id);
  }


  @Get(':id/doctors')
  async getClinicDoctors(@Param('id') id: string) {
    return this.clinicService.getClinicDoctors(id);
  }


  @Put(':id')
  @auth([RoleEnum.doctor, RoleEnum.admin])
  async update(
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
    @Request() req,
  ) {
    return this.clinicService.update(id, updateClinicDto, req.user._id);
  }


  @Delete(':id')
  @auth([RoleEnum.doctor, RoleEnum.admin])
  async remove(@Param('id') id: string, @Request() req) {
    return this.clinicService.softDelete(id, req.user._id);
  }


  @Post(':id/doctors/:doctorId')
  @auth([RoleEnum.doctor, RoleEnum.admin])
  async addDoctor(
    @Param('id') id: Types.ObjectId,
    @Param('doctorId') doctorId: string,
    @Request() req,
  ) {
    return this.clinicService.addDoctor(id, doctorId, req.user._id);
  }

  @Delete(':id/doctors/:doctorId')
  @auth([RoleEnum.doctor, RoleEnum.admin])
  async removeDoctor(
    @Param('id') id: string,
    @Param('doctorId') doctorId: string,
    @Request() req,
  ) {
    return this.clinicService.removeDoctor(id, doctorId, req.user._id);
  }
}