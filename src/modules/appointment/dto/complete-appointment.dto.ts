// src/modules/appointment/dto/complete-appointment.dto.ts

import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CompleteAppointmentDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isFollowUpRequired?: boolean;

  @IsOptional()
  followUpDate?: Date;
}