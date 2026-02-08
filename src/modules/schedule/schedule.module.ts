// src/modules/schedule/schedule.module.ts

import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleModel } from 'src/db/models/schedule.model';
import { ScheduleRepository } from 'src/db/repositories/schedule.repository';
import { AppointmentModel } from 'src/db/models/appointment.model';
import { AppointmentRepository } from 'src/db/repositories/appointment.repository';
import { DoctorModel } from 'src/db/models/doctor.model';
import { DoctorRepository } from 'src/db/repositories/doctor.repository';

@Module({
  imports: [
    ScheduleModel,
    AppointmentModel,
    DoctorModel,
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    ScheduleRepository,
    AppointmentRepository,
    DoctorRepository,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule { }