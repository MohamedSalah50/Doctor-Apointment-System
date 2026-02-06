// Path: src/db/models/appointment.model.ts

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  IAppointment,
  AppointmentStatusEnum,
  AppointmentTypeEnum,
  ConsultationModeEnum,
} from 'src/common';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Appointment implements IAppointment {
  // ==================== REFERENCES ====================
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Clinic', index: true })
  clinicId?: Types.ObjectId;

  // ==================== APPOINTMENT DETAILS ====================
  @Prop({ type: String, required: true, unique: true })
  appointmentNumber: string;

  @Prop({ type: Date, required: true, index: true })
  scheduledDate: Date;

  @Prop({
    type: String,
    enum: AppointmentTypeEnum,
    required: true,
    default: AppointmentTypeEnum.checkup,
  })
  appointmentType: AppointmentTypeEnum;

  @Prop({
    type: String,
    enum: ConsultationModeEnum,
    required: true,
    default: ConsultationModeEnum.inClinic,
  })
  consultationMode: ConsultationModeEnum;

  @Prop({ type: Number, required: true, default: 30, min: 15, max: 120 })
  duration: number;

  // ==================== STATUS & TRACKING ====================
  @Prop({
    type: String,
    enum: AppointmentStatusEnum,
    required: true,
    default: AppointmentStatusEnum.pending,
    index: true,
  })
  status: AppointmentStatusEnum;

  @Prop({ type: Date })
  confirmedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: String, maxlength: 500 })
  cancellationReason?: string;

  // ==================== FEES & PAYMENT ====================
  @Prop({ type: Number, required: true, min: 0 })
  consultationFee: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  platformFee: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalFee: number;

  @Prop({ type: Boolean, default: false, index: true })
  isPaid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  // ==================== PATIENT NOTES ====================
  @Prop({ type: String, maxlength: 1000 })
  chiefComplaint?: string;

  @Prop({ type: [String] })
  symptoms?: string[];

  @Prop({ type: String, maxlength: 500 })
  patientNotes?: string;

  // ==================== DOCTOR NOTES ====================
  @Prop({ type: String, maxlength: 2000 })
  diagnosis?: string;

  @Prop({ type: String, maxlength: 2000 })
  treatmentPlan?: string;

  @Prop({ type: String, maxlength: 1000 })
  doctorNotes?: string;

  @Prop({ type: Types.ObjectId, ref: 'MedicalRecord' })
  prescriptionId?: Types.ObjectId;

  // ==================== FOLLOW UP ====================
  @Prop({ type: Boolean, default: false })
  isFollowUp: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  previousAppointmentId?: Types.ObjectId;

  @Prop({ type: Date })
  nextFollowUpDate?: Date;

  // ==================== ONLINE CONSULTATION ====================
  @Prop({ type: String })
  meetingLink?: string;

  @Prop({ type: String })
  meetingId?: string;

  @Prop({ type: String, select: false }) // مش هيظهر في الـ queries
  meetingPassword?: string;

  // ==================== REMINDERS ====================
  @Prop({ type: Boolean, default: false })
  reminderSent: boolean;

  @Prop({ type: Date })
  reminderSentAt?: Date;

  // ==================== RATINGS & REVIEW ====================
  @Prop({ type: Types.ObjectId, ref: 'Review' })
  reviewId?: Types.ObjectId;

  // ==================== METADATA ====================
  @Prop({
    type: {
      rescheduledCount: { type: Number, default: 0 },
      rescheduledFrom: Date,
      noShowCount: { type: Number, default: 0 },
    },
    _id: false,
  })
  metadata?: {
    rescheduledCount?: number;
    rescheduledFrom?: Date;
    noShowCount?: number;
  };

  // ==================== SOFT DELETE ====================
  @Prop({ type: Date })
  deletedAt?: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// ==================== INDEXES ====================
AppointmentSchema.index({ patientId: 1, scheduledDate: -1 });
AppointmentSchema.index({ doctorId: 1, scheduledDate: 1 });
AppointmentSchema.index({ clinicId: 1, scheduledDate: 1 });
AppointmentSchema.index({ status: 1, scheduledDate: 1 });
AppointmentSchema.index({ appointmentNumber: 1 }, { unique: true });
AppointmentSchema.index({ scheduledDate: 1, status: 1 });
AppointmentSchema.index({ createdAt: -1 });

// Compound index للـ availability check
AppointmentSchema.index({
  doctorId: 1,
  scheduledDate: 1,
  status: 1,
});

// ==================== VIRTUALS ====================
// Check if appointment is upcoming
AppointmentSchema.virtual('isUpcoming').get(function (this: AppointmentDocument) {
  return (
    this.scheduledDate > new Date() &&
    [AppointmentStatusEnum.pending, AppointmentStatusEnum.confirmed].includes(
      this.status,
    )
  );
});

// Check if appointment is past
AppointmentSchema.virtual('isPast').get(function (this: AppointmentDocument) {
  return this.scheduledDate < new Date();
});

// Time until appointment (in minutes)
AppointmentSchema.virtual('minutesUntilAppointment').get(function (
  this: AppointmentDocument,
) {
  const diff = this.scheduledDate.getTime() - Date.now();
  return Math.floor(diff / 1000 / 60);
});

// ==================== MIDDLEWARE ====================
// Generate appointment number before save
AppointmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.appointmentNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    this.appointmentNumber = `APP-${year}-${random}`;
  }

  // Calculate total fee
  if (this.isModified('consultationFee') || this.isModified('platformFee')) {
    this.totalFee = this.consultationFee + this.platformFee;
  }

  next();
});

// Soft delete filter
AppointmentSchema.pre(['find', 'findOne'], function (next) {
  const query = this.getQuery();

  if (query.includeDeleted !== true) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }

  next();
});

// ==================== METHODS ====================
// Confirm appointment
// AppointmentSchema.methods.confirm = async function (this: AppointmentDocument) {
//   this.status = AppointmentStatusEnum.confirmed;
//   this.confirmedAt = new Date();
//   return await this.save();
// };

// // Complete appointment
// AppointmentSchema.methods.complete = async function (this: AppointmentDocument) {
//   this.status = AppointmentStatusEnum.completed;
//   this.completedAt = new Date();
//   return await this.save();
// };

// // Cancel appointment
// AppointmentSchema.methods.cancel = async function (
//   this: AppointmentDocument,
//   userId: Types.ObjectId,
//   reason?: string,
// ) {
//   this.status = AppointmentStatusEnum.cancelled;
//   this.cancelledAt = new Date();
//   this.cancelledBy = userId;
//   this.cancellationReason = reason;
//   return await this.save();
// };

// // Mark as no show
// AppointmentSchema.methods.markAsNoShow = async function (
//   this: AppointmentDocument,
// ) {
//   this.status = AppointmentStatusEnum.noShow;
  
//   if (!this.metadata) {
//     this.metadata = {};
//   }
//   this.metadata.noShowCount = (this.metadata.noShowCount || 0) + 1;
  
//   return await this.save();
// };

// // Reschedule appointment
// AppointmentSchema.methods.reschedule = async function (
//   this: AppointmentDocument,
//   newDate: Date,
// ) {
//   const oldDate = this.scheduledDate;
  
//   this.scheduledDate = newDate;
//   this.status = AppointmentStatusEnum.rescheduled;
  
//   if (!this.metadata) {
//     this.metadata = {};
//   }
  
//   this.metadata.rescheduledCount = (this.metadata.rescheduledCount || 0) + 1;
  
//   if (!this.metadata.rescheduledFrom) {
//     this.metadata.rescheduledFrom = oldDate;
//   }
  
//   return await this.save();
// };

// // Check if can be cancelled
// AppointmentSchema.methods.canBeCancelled = function (
//   this: AppointmentDocument,
// ): boolean {
//   // Can't cancel if already completed, cancelled, or past
//   if (
//     [
//       AppointmentStatusEnum.completed,
//       AppointmentStatusEnum.cancelled,
//       AppointmentStatusEnum.noShow,
//     ].includes(this.status)
//   ) {
//     return false;
//   }

//   // Can't cancel if appointment is in the past
//   if (this.scheduledDate < new Date()) {
//     return false;
//   }

//   return true;
// };

// // Check if can be rescheduled
// AppointmentSchema.methods.canBeRescheduled = function (
//   this: AppointmentDocument,
// ): boolean {
//   return this.canBeCancelled();
// };

// // Soft delete
// AppointmentSchema.methods.softDelete = async function (
//   this: AppointmentDocument,
// ) {
//   this.deletedAt = new Date();
//   return await this.save();
// };

export const AppointmentModel = MongooseModule.forFeature([
  {
    name: Appointment.name,
    schema: AppointmentSchema,
  },
]);