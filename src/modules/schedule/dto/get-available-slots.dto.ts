// src/modules/schedule/dto/get-available-slots.dto.ts

import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ConsultationModeEnum } from 'src/common';

export class GetAvailableSlotsDto {
  @IsNotEmpty()
  @IsString()
  date: string; // Format: YYYY-MM-DD

  @IsOptional()
  @IsEnum(ConsultationModeEnum)
  consultationMode?: ConsultationModeEnum;
}