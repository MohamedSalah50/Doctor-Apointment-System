// src/modules/schedule/dto/update-schedule.dto.ts

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ScheduleStatusEnum } from 'src/common';

export class UpdateScheduleDto extends PartialType(
  OmitType(CreateScheduleDto, ['isRecurring'] as const),
) {
  @IsOptional()
  @IsEnum(ScheduleStatusEnum)
  status?: ScheduleStatusEnum;
}