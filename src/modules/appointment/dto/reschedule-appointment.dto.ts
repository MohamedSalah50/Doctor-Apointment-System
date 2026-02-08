// src/modules/appointment/dto/reschedule-appointment.dto.ts

import { IsNotEmpty } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsNotEmpty()
  newDate: Date;
}