import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { ClinicModel, ClinicRepository } from 'src/db';

@Module({
  imports: [ClinicModel],
  controllers: [ClinicController],
  providers: [ClinicService, ClinicRepository],
})
export class ClinicModule { }
