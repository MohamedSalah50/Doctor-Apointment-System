import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  IDoctor,
  SpecialtyEnum,
  DoctorStatusEnum,
  DegreeEnum,
  ConsultationModeEnum,
} from 'src/common';

export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Doctor implements IDoctor {
  //  REFERENCE TO USER
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  //  PROFESSIONAL INFO
  @Prop({ type: String, enum: SpecialtyEnum, required: true })
  specialty: SpecialtyEnum;

  @Prop({ type: [String], enum: SpecialtyEnum })
  subSpecialties?: SpecialtyEnum[];

  @Prop({ type: String, enum: DegreeEnum, required: true })
  degree: DegreeEnum;

  @Prop({ type: String, required: true, unique: true })
  licenseNumber: string;

  @Prop({ type: Number, required: true, min: 0, max: 70 })
  yearsOfExperience: number;

  //  BIO & DESCRIPTION
  @Prop({ type: String, maxlength: 500 })
  bio?: string;

  @Prop({ type: String, maxlength: 2000 })
  about?: string;

  @Prop({ type: [String], default: ['Arabic'] })
  languages?: string[];

  //  EDUCATION
  @Prop({
    type: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        country: String,
      },
    ],
    _id: false,
  })
  education?: {
    degree: string;
    institution: string;
    year: number;
    country?: string;
  }[];

  //  CERTIFICATIONS
  @Prop({
    type: [
      {
        title: { type: String, required: true },
        issuedBy: { type: String, required: true },
        issuedDate: { type: Date, required: true },
        expiryDate: Date,
        certificateUrl: String,
      },
    ],
    _id: false,
  })
  certifications?: {
    title: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
    certificateUrl?: string;
  }[];

  //  CONSULTATION INFO
  @Prop({
    type: [String],
    enum: ConsultationModeEnum,
    required: true,
    default: [ConsultationModeEnum.inClinic],
  })
  consultationModes: ConsultationModeEnum[];

  @Prop({
    type: {
      inClinic: { type: Number, min: 0 },
      online: { type: Number, min: 0 },
      homeVisit: { type: Number, min: 0 },
      followUp: { type: Number, min: 0 },
    },
    required: true,
    _id: false,
  })
  consultationFee: {
    inClinic?: number;
    online?: number;
    homeVisit?: number;
    followUp?: number;
  };

  @Prop({ type: Number, required: true, default: 30, min: 15, max: 120 })
  sessionDuration: number;

  //  CLINIC/HOSPITAL AFFILIATIONS
  @Prop({ type: [Types.ObjectId], ref: 'Clinic' })
  clinics?: Types.ObjectId[];

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        address: String,
        position: String,
      },
    ],
    _id: false,
  })
  hospitals?: {
    name: string;
    address?: string;
    position?: string;
  }[];

  //  STATUS & AVAILABILITY
  @Prop({
    type: String,
    enum: DoctorStatusEnum,
    default: DoctorStatusEnum.available,
  })
  status: DoctorStatusEnum;

  @Prop({ type: Boolean, default: true })
  isAcceptingNewPatients: boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPatients?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalAppointments?: number;

  @Prop({
    type: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      iban: String,
    },
    _id: false,
    select: false, // مش هيظهر في الـ queries العادية (security)
  })
  bankAccount?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
  };

  //  COMMISSION
  @Prop({ type: Number, default: 10, min: 0, max: 100 })
  platformCommissionPercentage?: number;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.index({ userId: 1 });
DoctorSchema.index({ specialty: 1 });
DoctorSchema.index({ licenseNumber: 1 });
DoctorSchema.index({ rating: -1 });
DoctorSchema.index({ isVerified: 1, status: 1 });
DoctorSchema.index({ deletedAt: 1 });
DoctorSchema.index({ 'consultationFee.inClinic': 1 });

DoctorSchema.index({ specialty: 1, rating: -1, isVerified: 1 });

DoctorSchema.pre(['find', 'findOne'], function (next) {
  const query = this.getQuery();

  if (query.includeDeleted !== true) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }

  next();
});

DoctorSchema.methods.softDelete = async function (this: DoctorDocument) {
  this.deletedAt = new Date();
  this.status = DoctorStatusEnum.retired;
  return await this.save();
};

DoctorSchema.methods.restore = async function (this: DoctorDocument) {
  this.deletedAt = undefined;
  this.status = DoctorStatusEnum.available;
  return await this.save();
};

// Update rating method
DoctorSchema.methods.updateRating = async function (
  this: DoctorDocument,
  newRating: number,
) {
  const totalReviews = this.totalReviews || 0;
  const currentRating = this.rating || 0;

  // حساب المتوسط الجديد
  const newAverageRating =
    (currentRating * totalReviews + newRating) / (totalReviews + 1);

  this.rating = Number(newAverageRating.toFixed(2));
  this.totalReviews = totalReviews + 1;

  return await this.save();
};

DoctorSchema.methods.isAvailable = function (this: DoctorDocument): boolean {
  return (
    this.status === DoctorStatusEnum.available &&
    this.isAcceptingNewPatients &&
    !this.deletedAt
  );
};

export const DoctorModel = MongooseModule.forFeature([
  {
    name: Doctor.name,
    schema: DoctorSchema,
  },
]);
