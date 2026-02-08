// src/modules/appointment/dto/create-appointment.dto.ts

import {
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsString,
    IsNumber,
    Min,
} from 'class-validator';
import { Types } from 'mongoose';
import {
    AppointmentTypeEnum,
    ConsultationModeEnum,
    IAppointment,
} from 'src/common';

export class CreateAppointmentDto implements Partial<IAppointment> {
    @IsNotEmpty()
    @IsString()
    doctorId: Types.ObjectId;

    @IsOptional()
    @IsString()
    clinicId?: Types.ObjectId;

    @IsNotEmpty()
    scheduledDate: Date;

    @IsOptional()
    @IsNumber()
    @Min(10)
    duration?: number;

    @IsNotEmpty()
    @IsEnum(AppointmentTypeEnum)
    appointmentType: AppointmentTypeEnum;

    @IsNotEmpty()
    @IsEnum(ConsultationModeEnum)
    consultationMode: ConsultationModeEnum;

    @IsOptional()
    @IsNumber()
    @Min(0)
    fees?: number;

    @IsOptional()
    @IsString()
    chiefComplaint?: string;

    @IsOptional()
    @IsString()
    symptoms?: string[];

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    appointmentNumber: string;


}










