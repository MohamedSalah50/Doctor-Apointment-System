// src/modules/appointment/dto/cancel-appointment.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}