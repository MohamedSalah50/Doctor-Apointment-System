// Path: src/db/models/schedule.model.ts

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
    ISchedule,
    type IWorkingHours,
    DayOfWeekEnum,
    ScheduleStatusEnum,
    ConsultationModeEnum,
} from 'src/common';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Schedule implements ISchedule {
    // ==================== REFERENCES ====================
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    doctorId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Clinic', index: true })
    clinicId?: Types.ObjectId;

    // ==================== SCHEDULE TYPE ====================

    @Prop({ type: Boolean, required: true, default: true })
    isRecurring: boolean;//متكرر؟

    // For Recurring Schedules
    @Prop({ type: Number, enum: DayOfWeekEnum, index: true })
    dayOfWeek?: DayOfWeekEnum;

    @Prop({
        type: {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            breakStartTime: String,
            breakEndTime: String,
        },
        _id: false,
    })
    workingHours?: IWorkingHours;

    // For Specific Date Schedules
    @Prop({ type: Date, index: true })
    specificDate?: Date;

    @Prop({
        type: {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            breakStartTime: String,
            breakEndTime: String,
        },
        _id: false,
    })
    specificDateWorkingHours?: IWorkingHours;

    // ==================== CONSULTATION MODE ====================
    @Prop({
        type: String,
        enum: ConsultationModeEnum,
        required: true,
        default: ConsultationModeEnum.inClinic,
    })
    consultationMode: ConsultationModeEnum;

    // ==================== SLOT CONFIGURATION ====================
    @Prop({ type: Number, required: true, default: 30, min: 15, max: 120 })
    slotDuration: number;

    @Prop({ type: Number, default: 0, min: 0, max: 60 })
    bufferTime: number;

    @Prop({ type: Number, default: 1, min: 1, max: 10 })
    maxPatientsPerSlot: number;

    @Prop({ type: Number, min: 1 })
    maxAppointmentsPerDay?: number;

    // ==================== STATUS ====================
    @Prop({
        type: String,
        enum: ScheduleStatusEnum,
        required: true,
        default: ScheduleStatusEnum.active,
    })
    status: ScheduleStatusEnum;

    // ==================== EXCEPTIONS ====================
    @Prop({
        type: [
            {
                date: { type: Date, required: true },
                reason: { type: String, required: true },
                isAvailable: { type: Boolean, required: true },
                customWorkingHours: {
                    startTime: String,
                    endTime: String,
                    breakStartTime: String,
                    breakEndTime: String,
                },
            },
        ],
    })
    exceptions?: {
        date: Date;
        reason: string;
        isAvailable: boolean;
        customWorkingHours?: IWorkingHours;
    }[];

    // ==================== METADATA ====================
    @Prop({ type: String, maxlength: 500 })
    notes?: string;

    // ==================== SOFT DELETE ====================
    @Prop({ type: Date })
    deletedAt?: Date;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// ==================== INDEXES ====================
ScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 });
ScheduleSchema.index({ doctorId: 1, specificDate: 1 });
ScheduleSchema.index({ doctorId: 1, status: 1 });
ScheduleSchema.index({ clinicId: 1, dayOfWeek: 1 });

// Compound index للـ quick lookup
ScheduleSchema.index({
    doctorId: 1,
    isRecurring: 1,
    dayOfWeek: 1,
    status: 1,
});

// ==================== VALIDATIONS ====================
ScheduleSchema.pre('validate', function (next) {
    // Recurring schedule must have dayOfWeek and workingHours
    if (this.isRecurring) {
        if (this.dayOfWeek === undefined || !this.workingHours) {
            return next(
                new Error(
                    'Recurring schedule must have dayOfWeek and workingHours',
                ),
            );
        }
    }

    // Specific date schedule must have specificDate and specificDateWorkingHours
    if (!this.isRecurring) {
        if (!this.specificDate || !this.specificDateWorkingHours) {
            return next(
                new Error(
                    'Specific date schedule must have specificDate and specificDateWorkingHours',
                ),
            );
        }
    }

    next();
});

// Validate time format (HH:MM)
ScheduleSchema.pre('save', function (next) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    const validateWorkingHours = (hours: IWorkingHours | undefined) => {
        if (!hours) return;

        if (!timeRegex.test(hours.startTime) || !timeRegex.test(hours.endTime)) {
            throw new Error('Invalid time format. Use HH:MM format');
        }

        if (hours.breakStartTime && !timeRegex.test(hours.breakStartTime)) {
            throw new Error('Invalid break start time format. Use HH:MM format');
        }

        if (hours.breakEndTime && !timeRegex.test(hours.breakEndTime)) {
            throw new Error('Invalid break end time format. Use HH:MM format');
        }

        // Check if end time is after start time
        if (hours.startTime >= hours.endTime) {
            throw new Error('End time must be after start time');
        }

        // Check if break times are valid
        if (hours.breakStartTime && hours.breakEndTime) {
            if (hours.breakStartTime >= hours.breakEndTime) {
                throw new Error('Break end time must be after break start time');
            }

            if (
                hours.breakStartTime < hours.startTime ||
                hours.breakEndTime > hours.endTime
            ) {
                throw new Error('Break times must be within working hours');
            }
        }
    };

    validateWorkingHours(this.workingHours);
    validateWorkingHours(this.specificDateWorkingHours);

    next();
});

// Soft delete filter
ScheduleSchema.pre(['find', 'findOne'], function (next) {
    const query = this.getQuery();

    if (query.includeDeleted !== true) {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }

    next();
});

// ==================== METHODS ====================
// Check if schedule is active
// ScheduleSchema.methods.isActive = function (this: ScheduleDocument): boolean {
//   return this.status === ScheduleStatusEnum.active && !this.deletedAt;
// };

// // Get exception for a specific date
// ScheduleSchema.methods.getException = function (
//   this: ScheduleDocument,
//   date: Date,
// ) {
//   if (!this.exceptions) return null;

//   const dateStr = date.toISOString().split('T')[0];
//   return this.exceptions.find(
//     (exc) => exc.date.toISOString().split('T')[0] === dateStr,
//   );
// };

// // Add exception
// ScheduleSchema.methods.addException = async function (
//   this: ScheduleDocument,
//   exception: {
//     date: Date;
//     reason: string;
//     isAvailable: boolean;
//     customWorkingHours?: IWorkingHours;
//   },
// ) {
//   if (!this.exceptions) {
//     this.exceptions = [];
//   }

//   // Remove existing exception for this date
//   const dateStr = exception.date.toISOString().split('T')[0];
//   this.exceptions = this.exceptions.filter(
//     (exc) => exc.date.toISOString().split('T')[0] !== dateStr,
//   );

//   this.exceptions.push(exception);
//   return await this.save();
// };

// // Remove exception
// ScheduleSchema.methods.removeException = async function (
//   this: ScheduleDocument,
//   date: Date,
// ) {
//   if (!this.exceptions) return this;

//   const dateStr = date.toISOString().split('T')[0];
//   this.exceptions = this.exceptions.filter(
//     (exc) => exc.date.toISOString().split('T')[0] !== dateStr,
//   );

//   return await this.save();
// };

// // Generate time slots for a specific date
// ScheduleSchema.methods.generateTimeSlots = function (
//   this: ScheduleDocument,
//   date: Date,
// ): string[] {
//   const slots: string[] = [];

//   // Check for exception
//   const exception = this.getException(date);
//   if (exception && !exception.isAvailable) {
//     return [];
//   }

//   // Get working hours
//   let hours: IWorkingHours | undefined;
//   if (exception && exception.customWorkingHours) {
//     hours = exception.customWorkingHours;
//   } else if (this.isRecurring && this.workingHours) {
//     hours = this.workingHours;
//   } else if (!this.isRecurring && this.specificDateWorkingHours) {
//     hours = this.specificDateWorkingHours;
//   }

//   if (!hours) return [];

//   // Parse times
//   const [startHour, startMinute] = hours.startTime.split(':').map(Number);
//   const [endHour, endMinute] = hours.endTime.split(':').map(Number);

//   let breakStart: number | null = null;
//   let breakEnd: number | null = null;

//   if (hours.breakStartTime && hours.breakEndTime) {
//     const [bsHour, bsMinute] = hours.breakStartTime.split(':').map(Number);
//     const [beHour, beMinute] = hours.breakEndTime.split(':').map(Number);
//     breakStart = bsHour * 60 + bsMinute;
//     breakEnd = beHour * 60 + beMinute;
//   }

//   // Generate slots
//   let currentMinutes = startHour * 60 + startMinute;
//   const endMinutes = endHour * 60 + endMinute;

//   while (currentMinutes + this.slotDuration <= endMinutes) {
//     // Check if slot is during break
//     if (
//       breakStart !== null &&
//       breakEnd !== null &&
//       currentMinutes >= breakStart &&
//       currentMinutes < breakEnd
//     ) {
//       currentMinutes += this.slotDuration + this.bufferTime;
//       continue;
//     }

//     const hour = Math.floor(currentMinutes / 60);
//     const minute = currentMinutes % 60;
//     const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

//     slots.push(timeStr);
//     currentMinutes += this.slotDuration + this.bufferTime;
//   }

//   return slots;
// };

// // Soft delete
// ScheduleSchema.methods.softDelete = async function (this: ScheduleDocument) {
//   this.deletedAt = new Date();
//   this.status = ScheduleStatusEnum.inactive;
//   return await this.save();
// };

export const ScheduleModel = MongooseModule.forFeature([
    {
        name: Schedule.name,
        schema: ScheduleSchema,
    },
]);