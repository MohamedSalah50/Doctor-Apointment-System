import { Module } from '@nestjs/common';
import { DoctorController } from './doctors.controller';
import { DoctorService } from './doctors.service';
import { DoctorModel, DoctorRepository } from 'src/db';

@Module({
  imports: [DoctorModel],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
})
export class DoctorsModule { }
