import { Module } from '@nestjs/common';
import { DoctorController } from './doctors.controller';
import { DoctorService } from './doctors.service';
import { DoctorModel, DoctorRepository, ScheduleModel, ScheduleRepository } from 'src/db';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [DoctorModel, ScheduleModule],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
})
export class DoctorsModule { }
