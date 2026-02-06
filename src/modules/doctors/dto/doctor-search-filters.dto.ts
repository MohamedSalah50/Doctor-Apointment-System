// src/modules/doctor/dto/doctor-search-filters.dto.ts

import { IsOptional, IsEnum, IsBoolean, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SpecialtyEnum } from 'src/common';

export class DoctorSearchFiltersDto {
  @IsOptional()
  @IsEnum(SpecialtyEnum)
  specialty?: SpecialtyEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAcceptingNewPatients?: boolean;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxFee?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'rating';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}