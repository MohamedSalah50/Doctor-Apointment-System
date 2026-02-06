import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPatient, BloodTypeEnum } from 'src/common';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Patient implements IPatient {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // ==================== MEDICAL INFO ====================
  @Prop({ type: String, enum: BloodTypeEnum })
  bloodType?: BloodTypeEnum;

  @Prop({ type: [String] })
  allergies?: string[];

  @Prop({ type: [String] })
  chronicDiseases?: string[];

  // ==================== EMERGENCY CONTACT ====================
  @Prop({
    type: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    _id: false,
  })
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  // ==================== INSURANCE INFO ====================
  @Prop({ type: String })
  insuranceProvider?: string;

  @Prop({ type: String })
  insuranceNumber?: string;

  @Prop({ type: Date })
  insuranceExpiryDate?: Date;

  @Prop({ type: Number, min: 50, max: 300 })
  height?: number;

  @Prop({ type: Number, min: 20, max: 500 })
  weight?: number;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    _id: false,
  })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  @Prop({ type: String, enum: ['ar', 'en'], default: 'ar' })
  preferredLanguage?: 'ar' | 'en';

  @Prop({
    type: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    _id: false,
  })
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

PatientSchema.index({ userId: 1 });
PatientSchema.index({ deletedAt: 1 });
PatientSchema.index({ 'address.city': 1 });

PatientSchema.virtual('bmi').get(function (this: PatientDocument) {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return Number((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
  }
  return null;
});

PatientSchema.pre(['find', 'findOne'], function (next) {
  const query = this.getQuery();

  if (query.includeDeleted !== true) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }

  next();
});

PatientSchema.methods.softDelete = async function (this: PatientDocument) {
  this.deletedAt = new Date();
  return await this.save();
};

PatientSchema.methods.restore = async function (this: PatientDocument) {
  this.deletedAt = undefined;
  return await this.save();
};

export const PatientModel = MongooseModule.forFeature([
  {
    name: Patient.name,
    schema: PatientSchema,
  },
]);
