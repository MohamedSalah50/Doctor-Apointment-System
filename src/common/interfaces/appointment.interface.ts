// Path: src/common/interfaces/appointment.interface.ts

import { Types } from 'mongoose';
import {
  AppointmentStatusEnum,
  AppointmentTypeEnum,
  ConsultationModeEnum,
} from '../enums';

/**
 * Appointment Interface - معلومات الموعد
 */
export interface IAppointment {
  _id?: Types.ObjectId;

  // ==================== REFERENCES ====================
  patientId: Types.ObjectId; // Reference to User (role: patient)
  doctorId: Types.ObjectId; // Reference to User (role: doctor)
  clinicId?: Types.ObjectId; // Reference to Clinic (if in_clinic)

  // ==================== APPOINTMENT DETAILS ====================
  appointmentNumber: string; // رقم الموعد الفريد (APP-2025-001234)
  scheduledDate: Date; // تاريخ ووقت الموعد
  appointmentType: AppointmentTypeEnum; // checkup, follow_up, consultation, etc.
  consultationMode: ConsultationModeEnum; // in_clinic, online, home_visit

  duration: number; // مدة الموعد بالدقائق (default: 30)

  // ==================== STATUS & TRACKING ====================
  status: AppointmentStatusEnum; // pending, confirmed, completed, cancelled, etc.

  confirmedAt?: Date; // متى تم التأكيد
  completedAt?: Date; // متى تم الانتهاء
  cancelledAt?: Date; // متى تم الإلغاء

  cancelledBy?: Types.ObjectId; // مين اللي ألغى (patient or doctor)
  cancellationReason?: string;

  // ==================== FEES & PAYMENT ====================
  consultationFee: number; // سعر الكشف
  platformFee: number; // عمولة المنصة
  totalFee: number; // الإجمالي

  isPaid: boolean; // تم الدفع؟
  paymentId?: Types.ObjectId; // Reference to Payment

  // ==================== PATIENT NOTES ====================
  chiefComplaint?: string; // الشكوى الرئيسية (اللي المريض كاتبها)
  symptoms?: string[]; // الأعراض
  patientNotes?: string; // ملاحظات المريض

  // ==================== DOCTOR NOTES (after appointment) ====================
  diagnosis?: string; // التشخيص
  treatmentPlan?: string; // خطة العلاج
  doctorNotes?: string; // ملاحظات الدكتور
  prescriptionId?: Types.ObjectId; // Reference to Medical Record (prescription)

  // ==================== FOLLOW UP ====================
  isFollowUp: boolean; // هل ده موعد متابعة؟
  previousAppointmentId?: Types.ObjectId; // الموعد السابق
  nextFollowUpDate?: Date; // موعد المتابعة القادم

  // ==================== ONLINE CONSULTATION ====================
  meetingLink?: string; // لينك الميتنج (Zoom, Google Meet, etc.)
  meetingId?: string;
  meetingPassword?: string;

  // ==================== REMINDERS ====================
  reminderSent: boolean; // تم إرسال تذكير؟
  reminderSentAt?: Date;

  // ==================== RATINGS & REVIEW ====================
  reviewId?: Types.ObjectId; // Reference to Review

  // ==================== METADATA ====================
  metadata?: {
    rescheduledCount?: number; // عدد مرات إعادة الجدولة
    rescheduledFrom?: Date; // الموعد الأصلي
    noShowCount?: number; // عدد مرات عدم الحضور
  };


  // fees:Number

  // ==================== SOFT DELETE ====================
  deletedAt?: Date;

  // ==================== TIMESTAMPS ====================
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Appointment with Populated Data - للـ detailed view
 */
export interface IAppointmentWithDetails extends Omit<IAppointment, 'patientId' | 'doctorId' | 'clinicId'> {
  patientId: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    gender?: string;
    dateOfBirth?: Date;
  };
  doctorId: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    specialty: string;
    degree: string;
  };
  clinicId?: {
    _id: Types.ObjectId;
    name: string;
    address: string;
    phoneNumber: string;
  };
}

/**
 * Appointment List Item - للـ list views (أخف)
 */
export interface IAppointmentListItem {
  id: Types.ObjectId;
  appointmentNumber: string;
  scheduledDate: Date;
  status: AppointmentStatusEnum;
  appointmentType: AppointmentTypeEnum;
  consultationMode: ConsultationModeEnum;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  consultationFee: number;
  isPaid: boolean;
}

/**
 * Appointment Stats - إحصائيات
 */
export interface IAppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
  past: number;
  todayAppointments: number;
}

/**
 * Time Slot - وقت متاح للحجز
 */
export interface ITimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isBooked?: boolean;
  appointmentId?: Types.ObjectId;
}

/**
 * Available Slots Response
 */
export interface IAvailableSlots {
  date: Date;
  slots: ITimeSlot[];
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}