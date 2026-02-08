import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentModel, AppointmentRepository, DoctorModel, DoctorRepository, PatientModel, PatientRepository, ScheduleModel, ScheduleRepository } from 'src/db';

@Module({
  imports: [AppointmentModel, ScheduleModel, PatientModel, DoctorModel],
  controllers: [AppointmentController],
  providers: [AppointmentService, ScheduleRepository, PatientRepository, DoctorRepository, AppointmentRepository],
})
export class AppointmentModule { }
