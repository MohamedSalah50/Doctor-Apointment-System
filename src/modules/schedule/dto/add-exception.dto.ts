// src/modules/schedule/dto/add-exception.dto.ts

import { IsNotEmpty, IsBoolean, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHoursDto {
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @IsOptional()
  @IsString()
  breakEndTime?: string;
}

export class AddExceptionDto {
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  customWorkingHours?: WorkingHoursDto;
}
