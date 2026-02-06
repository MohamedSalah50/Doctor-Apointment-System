// src/modules/clinic/dto/nearby-clinics.dto.ts

import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyClinicsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  maxDistance?: number = 5000; // 5km default
}