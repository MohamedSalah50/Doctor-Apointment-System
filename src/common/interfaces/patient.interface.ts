import { Types } from 'mongoose';
import { BloodTypeEnum, AllergyEnum } from '../enums';

export interface IPatient {
  _id?: Types.ObjectId;

  //  REFERENCE TO USER
  userId: Types.ObjectId;

  //  MEDICAL INFO
  bloodType?: BloodTypeEnum;
  allergies?: AllergyEnum[] | string[]; // يقدر يختار من القائمة أو يضيف custom
  chronicDiseases?: string[]; // أمراض مزمنة (سكر، ضغط، إلخ)

  //  EMERGENCY CONTACT
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  //  INSURANCE INFO
  insuranceProvider?: string; // شركة التأمين
  insuranceNumber?: string;
  insuranceExpiryDate?: Date;

  //  MEDICAL HISTORY
  height?: number;
  weight?: number;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  preferredLanguage?: 'ar' | 'en';
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientWithUser extends Omit<IPatient, 'userId'> {
  userId: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    gender?: string;
    dateOfBirth?: Date;
  };
}

export interface IPatientMedicalSummary {
  patientId: Types.ObjectId;
  bloodType?: BloodTypeEnum;
  allergies: string[];
  chronicDiseases: string[];
  lastVisit?: Date;
  totalVisits?: number;
  bmi?: number; // Body Mass Index
}
