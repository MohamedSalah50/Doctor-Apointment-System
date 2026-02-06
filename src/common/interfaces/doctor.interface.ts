// Path: src/common/interfaces/doctor.interface.ts

import { Types } from 'mongoose';
import {
  SpecialtyEnum,
  DoctorStatusEnum,
  DegreeEnum,
  ConsultationModeEnum,
} from '../enums';

export interface IDoctor {
  _id?: Types.ObjectId;

  //  REFERENCE TO USER
  userId: Types.ObjectId; // Reference to User model

  //  PROFESSIONAL INFO
  specialty: SpecialtyEnum; // التخصص الأساسي
  subSpecialties?: SpecialtyEnum[]; // تخصصات فرعية
  degree: DegreeEnum; // الدرجة العلمية
  licenseNumber: string; // رقم الترخيص
  yearsOfExperience: number;

  //  BIO & DESCRIPTION
  bio?: string; // نبذة عن الدكتور (max 500 chars)
  about?: string; // تفاصيل أكثر (max 2000 chars)
  languages?: string[]; // اللغات (Arabic, English, French, etc.)

  //  EDUCATION & CERTIFICATES
  education?: {
    degree: string;
    institution: string;
    year: number;
    country?: string;
  }[];

  certifications?: {
    title: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
    certificateUrl?: string; // رابط الشهادة
  }[];

  //  CONSULTATION INFO
  consultationModes: ConsultationModeEnum[]; // [in_clinic, online, home_visit]
  consultationFee: {
    inClinic?: number;
    online?: number;
    homeVisit?: number;
    followUp?: number; // سعر الزيارة المتابعة
  };

  sessionDuration: number; // مدة الجلسة بالدقائق (default: 30)

  //  CLINIC/HOSPITAL AFFILIATIONS
  clinics?: Types.ObjectId[]; // Reference to Clinic model
  hospitals?: {
    name: string;
    address?: string;
    position?: string; // Consultant, Head of Department, etc.
  }[];

  //  STATUS & AVAILABILITY
  status: DoctorStatusEnum; // available, busy, on_leave, retired
  isAcceptingNewPatients: boolean;
  isVerified: boolean; // التحقق من الهوية والشهادات

  //  RATINGS & STATS
  rating?: number; // Average rating (0-5)
  totalReviews?: number;
  totalPatients?: number;
  totalAppointments?: number;

  //  BANK INFO (للدفع)
  bankAccount?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
  };

  //  COMMISSION
  platformCommissionPercentage?: number; // نسبة العمولة للمنصة (default: 10%)

  //  SOFT DELETE
  deletedAt?: Date;

  //  TIMESTAMPS
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorWithUser extends Omit<IDoctor, 'userId'> {
  userId: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    gender?: string;
    isActive: boolean;
  };
}

export interface IDoctorPublicProfile {
  _id: Types.ObjectId;
  fullName: string;
  avatar?: string;
  specialty: SpecialtyEnum;
  subSpecialties?: SpecialtyEnum[];
  degree: DegreeEnum;
  yearsOfExperience: number;
  about:string,
  bio?: string;
  languages?: string[];
  consultationModes: ConsultationModeEnum[];
  consultationFee: {
    inClinic?: number;
    online?: number;
    homeVisit?: number;
  };
  sessionDuration: number;
  rating?: number;
  totalReviews?: number;
  isAcceptingNewPatients: boolean;
  isVerified: boolean;
  clinics?: {
    id: Types.ObjectId;
    name: string;
    address: string;
  }[];
}

export interface IDoctorStats {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
}
