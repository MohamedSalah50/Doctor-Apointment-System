// src/modules/schedule/schedule.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddExceptionDto } from "./dto/add-exception.dto"
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { Types } from 'mongoose';
@auth([RoleEnum.doctor])
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto, @Request() req) {
    return this.scheduleService.create(createScheduleDto, req.user._id);
  }


  @Get('my-schedules')
  async getMySchedules(@Request() req) {
    return this.scheduleService.getMySchedules(req.user._id);
  }


  @Get(':id')

  async getScheduleById(@Param('id') id: Types.ObjectId, @Request() req) {
    return this.scheduleService.getScheduleById(id, req.user._id);
  }


  @Put(':id')
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req,
  ) {
    return this.scheduleService.updateSchedule(id, updateScheduleDto, req.user._id);
  }


  @Delete(':id')
  async deleteSchedule(@Param('id') id: string, @Request() req) {
    return this.scheduleService.deleteSchedule(id, req.user._id);
  }


  @Post(':id/exceptions')
  async addException(
    @Param('id') id: string,
    @Body() addExceptionDto: AddExceptionDto,
    @Request() req,
  ) {
    return this.scheduleService.addException(id, addExceptionDto, req.user._id);
  }


  @Delete(':id/exceptions/:date')
  async removeException(
    @Param('id') id: string,
    @Param('date') date: string,
    @Request() req,
  ) {
    return this.scheduleService.removeException(id, date, req.user._id);
  }
}

