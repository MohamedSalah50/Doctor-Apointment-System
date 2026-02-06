import { Types } from 'mongoose';
import { GenderEnum, RoleEnum } from '../enums';

export interface IUser {
  _id?: Types.ObjectId;

  // ==================== BASIC INFO ====================
  fullName: string;
  userName: string;
  email: string;
  password: string;

  // ==================== OPTIONAL CONTACT INFO ====================
  phoneNumber?: string;
  isPhoneVerified?: boolean;

  // ==================== PROFILE ====================
  avatar?: string; // URL للصورة الشخصية
  gender?: GenderEnum;
  dateOfBirth?: Date;

  // ==================== ROLE & STATUS ====================
  role: RoleEnum;
  isActive: boolean;
  isEmailVerified?: boolean;

  // ==================== SECURITY ====================
  changeCredentialTime?: Date; // لما يغير الباسورد
  lastLoginAt?: Date;

  // ==================== SOFT DELETE ====================
  freezedAt?: boolean | Date;

  // ==================== TIMESTAMPS ====================
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse extends Omit<IUser, 'password'> {
  id: Types.ObjectId | string;
}

// export interface LoginCredentialsResponse {
//   user: IUserResponse;
//   tokens: {
//     accessToken: string;
//     refreshToken: string;
//   };
// }
