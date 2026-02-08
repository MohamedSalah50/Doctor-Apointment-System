// src/modules/schedule/dto/create-schedule.dto.ts

import {
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
    Max,
    ValidateNested,
    IsString,
    Matches,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConsultationModeEnum, DayOfWeekEnum, ISchedule } from 'src/common';
import { Types } from 'mongoose';

class WorkingHoursDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:MM format',
    })
    startTime: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:MM format',
    })
    endTime: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Break start time must be in HH:MM format',
    })
    breakStartTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Break end time must be in HH:MM format',
    })
    breakEndTime?: string;
}

export class CreateScheduleDto implements Partial<ISchedule> {
    @IsNotEmpty()
    @IsBoolean()
    isRecurring: boolean;

    // For recurring schedules
    @ValidateIf((o) => o.isRecurring === true)
    @IsNotEmpty()
    @IsEnum(DayOfWeekEnum)
    dayOfWeek?: DayOfWeekEnum;

    @ValidateIf((o) => o.isRecurring === true)
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => WorkingHoursDto)
    workingHours?: WorkingHoursDto;

    // For specific date schedules
    @ValidateIf((o) => o.isRecurring === false)
    @IsNotEmpty()
    specificDate?: Date;

    @ValidateIf((o) => o.isRecurring === false)
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => WorkingHoursDto)
    specificDateWorkingHours?: WorkingHoursDto;

    @IsNotEmpty()
    @IsEnum(ConsultationModeEnum)
    consultationMode: ConsultationModeEnum;

    @IsNotEmpty()
    @IsNumber()
    @Min(10)
    @Max(180)
    slotDuration: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(60)
    bufferTime?: number;

    @IsOptional()
    @IsString()
    clinicId?: Types.ObjectId;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    maxPatientsPerSlot?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxAppointmentsPerDay?: number;
}




