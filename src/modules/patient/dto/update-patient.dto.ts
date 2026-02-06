// src/modules/patient/dto/update-patient.dto.ts

import { IsOptional, IsString, IsEnum, IsNumber, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { BloodTypeEnum, containField } from 'src/common';

@containField()
class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  phoneNumber: string;
}

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdatePatientDto {
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
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @IsOptional()
  insuranceExpiryDate?: Date;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsEnum(['ar', 'en'])
  preferredLanguage?: 'ar' | 'en';
}