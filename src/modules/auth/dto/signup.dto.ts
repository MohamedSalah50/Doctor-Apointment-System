import {
  IsEmail,
  isEnum,
  isNotEmpty,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  BloodTypeEnum,
  DegreeEnum,
  GenderEnum,
  IsMatched,
  IUser,
  RoleEnum,
  SpecialtyEnum,
} from 'src/common';

export class signupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(6)
  @IsMatched<string>(['password'], {
    message: 'password and confirmPassword mismatched',
  })
  confirmPassword: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  role: RoleEnum;

  @IsString()
  @IsOptional()
  gender?: GenderEnum;

  @IsString()
  @IsOptional()
  dateOfBirth?: Date;

  // Patient-specific fields (optional)
  @IsOptional()
  bloodType?: BloodTypeEnum;

  // Doctor-specific fields (required if role is doctor)
  @IsOptional()
  specialty?: SpecialtyEnum;
  @IsOptional()
  degree?: DegreeEnum;
  @IsOptional()
  licenseNumber?: string;
  @IsOptional()
  yearsOfExperience?: number;
  @IsOptional()
  consultationFee?: {
    inClinic?: number;
    online?: number;
  };
}
