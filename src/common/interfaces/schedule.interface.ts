// Path: src/common/interfaces/schedule.interface.ts

import { Types } from 'mongoose';
import { DayOfWeekEnum, ScheduleStatusEnum, ConsultationModeEnum } from '../enums';

/**
 * Working Hours - ساعات العمل في يوم معين
 */
export interface IWorkingHours {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breakStartTime?: string; // "13:00" (وقت البريك)
  breakEndTime?: string; // "14:00"
}

/**
 * Schedule Interface - جدول الدكتور
 */
export interface ISchedule {
  _id?: Types.ObjectId;

  // ==================== REFERENCES ====================
  doctorId: Types.ObjectId; // Reference to User (role: doctor)
  clinicId?: Types.ObjectId; // Reference to Clinic (optional)

  // ==================== SCHEDULE TYPE ====================
  isRecurring: boolean; // هل ده جدول متكرر؟
  
  // For Recurring Schedules
  dayOfWeek?: DayOfWeekEnum; // 0=Sunday, 6=Saturday
  workingHours?: IWorkingHours;

  // For Specific Date Schedules (overrides, holidays, etc.)
  specificDate?: Date; // تاريخ محدد
  specificDateWorkingHours?: IWorkingHours;

  // ==================== CONSULTATION MODE ====================
  consultationMode: ConsultationModeEnum; // in_clinic, online, home_visit

  // ==================== SLOT CONFIGURATION ====================
  slotDuration: number; // مدة كل slot بالدقائق (default: 30)
  bufferTime: number; // وقت بين كل موعد والتاني (default: 0)
  
  maxPatientsPerSlot: number; // عدد المرضى في نفس الوقت (default: 1)
  maxAppointmentsPerDay?: number; // الحد الأقصى للمواعيد في اليوم

  // ==================== STATUS ====================
  status: ScheduleStatusEnum; // active, inactive, holiday

  // ==================== EXCEPTIONS ====================
  // أيام الإجازات أو التعديلات
  exceptions?: {
    date: Date;
    reason: string; // "إجازة", "مؤتمر", etc.
    isAvailable: boolean;
    customWorkingHours?: IWorkingHours;
  }[];

  // ==================== METADATA ====================
  notes?: string; // ملاحظات

  // ==================== SOFT DELETE ====================
  deletedAt?: Date;

  // ==================== TIMESTAMPS ====================
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Schedule with Doctor Info
 */
// export interface IScheduleWithDoctor extends ISchedule {
//   doctorId: {
//     _id: Types.ObjectId;
//     fullName: string;
//     specialty: string;
//   };
// }

/**
 * Weekly Schedule - الجدول الأسبوعي كامل
 */
export interface IWeeklySchedule {
  doctorId: Types.ObjectId;
  schedules: {
    [key in DayOfWeekEnum]?: ISchedule;
  };
}

/**
 * Time Slot Template - للـ slots المتاحة
 */
export interface ITimeSlotTemplate {
  time: string; // "09:00"
  available: boolean;
  reason?: string; // "booked", "break", "out_of_hours"
}

/**
 * Day Schedule - جدول يوم واحد مع الـ slots
 */
export interface IDaySchedule {
  date: Date;
  dayOfWeek: DayOfWeekEnum;
  workingHours?: IWorkingHours;
  slots: ITimeSlotTemplate[];
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayReason?: string;
}