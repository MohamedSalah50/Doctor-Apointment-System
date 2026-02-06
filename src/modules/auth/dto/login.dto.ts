import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل  بريد الكتروني' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل كلمة مرور صالحة' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
