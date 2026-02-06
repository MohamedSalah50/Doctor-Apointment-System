// src/modules/patient/patient.controller.ts

import {
  Controller,
  Get,
  Put,
  Body,
  Request,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdateMedicalInfoDto } from './dto/update-medical-info.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { type IAuthRequest, RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';


@auth([RoleEnum.patient])
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }


  @Get('my-profile')
  async getMyProfile(@Request() req: IAuthRequest) {
    return this.patientService.getMyProfile(req.user._id);
  }


  @Put('my-profile')
  async updateMyProfile(
    @Request() req,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.updateMyProfile(req.user._id, updatePatientDto);
  }


  @Put('medical-info')
  async updateMedicalInfo(
    @Request() req,
    @Body() updateMedicalInfoDto: UpdateMedicalInfoDto,
  ) {
    return this.patientService.updateMedicalInfo(req.user._id, updateMedicalInfoDto);
  }


  @Put('emergency-contact')
  async updateEmergencyContact(
    @Request() req,
    @Body() updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    return this.patientService.updateEmergencyContact(
      req.user._id,
      updateEmergencyContactDto,
    );
  }


  @Get('medical-summary')
  async getMedicalSummary(@Request() req) {
    return this.patientService.getMedicalSummary(req.user._id);
  }
}