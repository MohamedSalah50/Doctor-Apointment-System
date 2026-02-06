import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { IUser } from 'src/common';

export class CreateUserDto implements Partial<IUser> {
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل الاسم بالكامل' })
  @MinLength(7, { message: 'اسم المستخدم يجب ألا يقل عن 7 أحرف' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل اسم المستخدم' })
  @MinLength(7, { message: 'اسم المستخدم يجب ألا يقل عن 7 أحرف' })
  userName: string;

  @IsEmail({}, { message: 'من فضلك ادخل بريد الكتروني صالح' })
  @IsNotEmpty({ message: 'من فضلك ادخل البريد الالكتروني' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  @IsStrongPassword()
  password: string;
}
