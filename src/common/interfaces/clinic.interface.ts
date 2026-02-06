// Path: src/common/interfaces/clinic.interface.ts

import { Types } from 'mongoose';

/**
 * Clinic Interface - معلومات العيادة/المستشفى
 */
export interface IClinic {
  _id?: Types.ObjectId;

  // ==================== BASIC INFO ====================
  name: string;
  nameAr?: string; // الاسم بالعربي
  description?: string;
  descriptionAr?: string;

  // ==================== CONTACT INFO ====================
  phoneNumber: string;
  alternativePhoneNumber?: string;
  email?: string;
  website?: string;

  // ==================== ADDRESS ====================
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    buildingNumber?: string;
    floorNumber?: string;
    landmark?: string; // معلم مميز
  };

  // ==================== IMAGES ====================
  logo?: string;
  images?: string[]; // صور العيادة

  // ==================== FACILITIES & AMENITIES ====================
  facilities?: string[]; // ["Parking", "WiFi", "Wheelchair Access", "Pharmacy", etc.]

  hasParking: boolean;
  hasWifi: boolean;
  hasPharmacy: boolean;
  isWheelchairAccessible: boolean;

  // ==================== WORKING HOURS ====================
  workingHours?: {
    dayOfWeek: number; // 0-6
    openTime: string; // "09:00"
    closeTime: string; // "22:00"
    isClosed: boolean;
  }[];

  // ==================== DOCTORS ====================
  doctors?: Types.ObjectId[]; // References to Doctor model

  // ==================== SERVICES ====================
  services?: string[]; // ["General Checkup", "Laboratory", "X-Ray", etc.]

  // ==================== INSURANCE ====================
  acceptedInsuranceProviders?: string[]; // شركات التأمين المقبولة

  // ==================== RATINGS ====================
  rating?: number; // Average rating
  totalReviews?: number;

  // ==================== STATUS ====================
  isActive: boolean;
  isVerified: boolean; // تم التحقق من العيادة

  // ==================== OWNER INFO ====================
  ownerId?: Types.ObjectId; // Reference to User (admin of clinic)
  licenseNumber?: string; // رقم الترخيص
  licenseExpiryDate?: Date;

  // ==================== METADATA ====================
  establishedYear?: number;
  totalPatients?: number;
  totalAppointments?: number;

  // ==================== SOFT DELETE ====================
  deletedAt?: Date;

  // ==================== TIMESTAMPS ====================
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Clinic with Populated Doctors
 */
export interface IClinicWithDoctors extends Omit<IClinic, "doctors"> {
  doctors: {
    _id: Types.ObjectId;
    fullName: string;
    specialty: string;
    rating: number;
    avatar?: string;
  }[];
}

/**
 * Clinic Public Profile - المعلومات العامة
 */
export interface IClinicPublicProfile {
  id: Types.ObjectId;
  name: string;
  nameAr?: string;
  description?: string;
  logo?: string;
  images?: string[];
  address: {
    city: string;
    state: string;
    country: string;
  };
  phoneNumber: string;
  rating?: number;
  totalReviews?: number;
  facilities?: string[];
  services?: string[];
  hasParking: boolean;
  hasWifi: boolean;
  isWheelchairAccessible: boolean;
  workingHours?: any[];
  doctorCount?: number;
}

/**
 * Clinic Search Result
 */
export interface IClinicSearchResult {
  id: Types.ObjectId;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  rating?: number;
  distance?: number; // المسافة بالكيلومتر (إذا كان في geolocation)
  doctorCount: number;
  logo?: string;
}

/**
 * Nearby Clinics
 */
export interface INearbyClinic extends IClinicSearchResult {
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
}