// src/modules/doctor/dto/update-doctor.dto.ts

import {
    IsOptional,
    IsEnum,
    IsString,
    IsNumber,
    IsArray,
    IsBoolean,
    Min,
    Max,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpecialtyEnum, ConsultationModeEnum } from 'src/common';

class EducationDto {
    @IsString()
    degree: string;

    @IsString()
    institution: string;

    @IsNumber()
    @Min(1900)
    @Max(2100)
    year: number;

    @IsOptional()
    @IsString()
    country?: string;
}

class CertificationDto {
    @IsString()
    title: string;

    @IsString()
    issuedBy: string;

    @IsOptional()
    issuedDate?: Date;

    @IsOptional()
    expiryDate?: Date;
}

class ConsultationFeeDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    inClinic?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    online?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    homeVisit?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    followUp?: number;
}




export class UpdateDoctorDto {
    @IsOptional()
    @IsEnum(SpecialtyEnum)
    specialty?: SpecialtyEnum;

    @IsOptional()
    @IsArray()
    @IsEnum(SpecialtyEnum, { each: true })
    subSpecialties?: SpecialtyEnum[];

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    education?: EducationDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertificationDto)
    certifications?: CertificationDto[];

    @IsOptional()
    @IsArray()
    @IsEnum(ConsultationModeEnum, { each: true })
    consultationModes?: ConsultationModeEnum[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ConsultationFeeDto)
    consultationFee?: ConsultationFeeDto;

    @IsOptional()
    @IsNumber()
    @Min(10)
    @Max(180)
    sessionDuration?: number;

    @IsOptional()
    @IsBoolean()
    isAcceptingNewPatients?: boolean;
}