import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DoctorModel, DoctorRepository, PatientModel, PatientRepository } from 'src/db';

@Module({
  imports: [PatientModel,DoctorModel],
  controllers: [AuthController],
  providers: [AuthService,PatientRepository,DoctorRepository],
})
export class AuthModule {}
