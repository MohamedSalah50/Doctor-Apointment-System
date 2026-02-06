import { IsNotEmpty, IsString, MinLength } from "class-validator"


export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "please inter your old password" })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: "please inter your new password" })
    @MinLength(6, { message: "password must be at least 6 characters" })
    newPassword: string;
}