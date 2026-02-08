// src/modules/appointment/appointment.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto'
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto"
import { CompleteAppointmentDto } from "./dto/complete-appointment.dto"
import { AppointmentFiltersDto } from "./dto/appointment-filters.dto"
import { type IAuthRequest, RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  // ==================== PATIENT ENDPOINTS ====================


  @Post()
  @auth([RoleEnum.patient])
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      req.user._id,
    );
  }


  @auth([RoleEnum.patient])
  @Get('my-appointments')
  async getMyAppointments(
    @Request() req,
    @Query() filters: AppointmentFiltersDto,
  ) {
    return this.appointmentService.getMyAppointments(req.user._id, filters);
  }

  /**
   * PUT /appointments/:id/reschedule
   * Reschedule appointment (Patient)
   */
  @auth([RoleEnum.patient])
  @Put(':id/reschedule')
  async rescheduleAppointment(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.rescheduleAppointment(
      id,
      rescheduleDto,
      req.user._id,
    );
  }

  // ==================== DOCTOR ENDPOINTS ====================


  @Get('doctor-appointments')
  @auth([RoleEnum.doctor])
  async getDoctorAppointments(
    @Request() req,
    @Query() filters: AppointmentFiltersDto,
  ) {
    return this.appointmentService.getDoctorAppointments(req.user._id, filters);
  }

  /**
   * PUT /appointments/:id/confirm
   * Confirm appointment (Doctor)
   */
  @Put(':id/confirm')
  @auth([RoleEnum.doctor])
  async confirmAppointment(@Param('id') id: string, @Request() req) {
    return this.appointmentService.confirmAppointment(id, req.user._id);
  }

  /**
   * PUT /appointments/:id/complete
   * Complete appointment (Doctor)
   */
  @Put(':id/complete')
  @auth([RoleEnum.doctor])
  async completeAppointment(
    @Param('id') id: string,
    @Body() completeDto: CompleteAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.completeAppointment(
      id,
      completeDto,
      req.user._id,
    );
  }

  /**
   * PUT /appointments/:id/no-show
   * Mark as no-show (Doctor)
   */
  @Put(':id/no-show')
  @auth([RoleEnum.doctor])
  async markNoShow(@Param('id') id: string, @Request() req) {
    return this.appointmentService.markNoShow(id, req.user._id);
  }

  // ==================== SHARED ENDPOINTS ====================

  /**
   * GET /appointments/:id
   * Get appointment by ID (Patient or Doctor)
   */
  @Get(':id')
  @auth([RoleEnum.patient, RoleEnum.doctor])
  async getAppointmentById(@Param('id') id: string, @Request() req:IAuthRequest) {
    return this.appointmentService.getAppointmentById(id, req.user._id);
  }

  /**
   * PUT /appointments/:id/cancel
   * Cancel appointment (Patient or Doctor)
   */
  @Put(':id/cancel')
  @auth([RoleEnum.patient, RoleEnum.doctor])
  async cancelAppointment(
    @Param('id') id: string,
    @Body() cancelDto: CancelAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.cancelAppointment(
      id,
      cancelDto,
      req.user._id,
    );
  }
}