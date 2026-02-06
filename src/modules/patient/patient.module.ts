import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientModel, PatientRepository } from 'src/db';

@Module({
  imports: [PatientModel],
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
})
export class PatientModule { }
