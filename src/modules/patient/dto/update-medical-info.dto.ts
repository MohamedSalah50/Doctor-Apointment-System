// src/modules/patient/dto/update-medical-info.dto.ts

import { IsOptional, IsEnum, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';
import { BloodTypeEnum } from 'src/common';

export class UpdateMedicalInfoDto {
  @IsOptional()
  @IsEnum(BloodTypeEnum)
  bloodType?: BloodTypeEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicDiseases?: string[];

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;
}


