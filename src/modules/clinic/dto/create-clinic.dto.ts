// src/modules/clinic/dto/create-clinic.dto.ts

import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEmail,
    IsBoolean,
    IsArray,
    IsNumber,
    Min,
    Max,
    ValidateNested,
    IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IClinic } from 'src/common';

class ClinicAddressDto {
    @IsNotEmpty()
    @IsString()
    street: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    buildingNumber?: string;

    @IsOptional()
    @IsString()
    floorNumber?: string;

    @IsOptional()
    @IsString()
    landmark?: string;
}

// class LocationDto {
//     @IsNotEmpty()
//     @IsNumber()
//     @Min(-180)
//     @Max(180)
//     longitude: number;

//     @IsNotEmpty()
//     @IsNumber()
//     @Min(-90)
//     @Max(90)
//     latitude: number;
// }

class WorkingHoursDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @IsNotEmpty()
    @IsString()
    openTime: string;

    @IsNotEmpty()
    @IsString()
    closeTime: string;

    @IsOptional()
    @IsBoolean()
    isClosed: boolean;
}

export class CreateClinicDto implements Partial<IClinic> {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    nameAr?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    descriptionAr?: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsOptional()
    @IsString()
    alternativePhoneNumber?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsUrl()
    website?: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ClinicAddressDto)
    address: ClinicAddressDto;



    @IsOptional()
    @IsUrl()
    logo?: string;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    images?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    facilities?: string[];

    @IsOptional()
    @IsBoolean()
    hasParking?: boolean;

    @IsOptional()
    @IsBoolean()
    hasWifi?: boolean;

    @IsOptional()
    @IsBoolean()
    hasPharmacy?: boolean;

    @IsOptional()
    @IsBoolean()
    isWheelchairAccessible?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkingHoursDto)
    workingHours?: WorkingHoursDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    services?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    acceptedInsuranceProviders?: string[];

    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @IsOptional()
    licenseExpiryDate?: Date;

    @IsOptional()
    @IsNumber()
    @Min(1900)
    @Max(2100)
    establishedYear?: number;
}