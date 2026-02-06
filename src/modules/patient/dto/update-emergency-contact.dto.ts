// src/modules/patient/dto/update-emergency-contact.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateEmergencyContactDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    relationship: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;
}