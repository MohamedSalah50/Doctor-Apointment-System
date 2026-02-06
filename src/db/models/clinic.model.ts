// Path: src/db/models/clinic.model.ts

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IClinic } from 'src/common';

export type ClinicDocument = HydratedDocument<Clinic>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Clinic implements IClinic {
  // ==================== BASIC INFO ====================
  @Prop({ type: String, required: true, minlength: 3, maxlength: 200 })
  name: string;

  @Prop({ type: String, minlength: 3, maxlength: 200 })
  nameAr?: string;

  @Prop({ type: String, maxlength: 2000 })
  description?: string;

  @Prop({ type: String, maxlength: 2000 })
  descriptionAr?: string;

  // ==================== CONTACT INFO ====================
  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String })
  alternativePhoneNumber?: string;

  @Prop({ type: String, lowercase: true })
  email?: string;

  @Prop({ type: String })
  website?: string;

  // ==================== ADDRESS ====================
  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: String,
      country: { type: String, required: true },
      buildingNumber: String,
      floorNumber: String,
      landmark: String,
    },
    required: true,
    _id: false,
  })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    buildingNumber?: string;
    floorNumber?: string;
    landmark?: string;
  };

  // ==================== LOCATION (GEOSPATIAL) ====================
  // @Prop({
  //   type: {
  //     type: { type: String, enum: ['Point'], default: 'Point' },
  //     coordinates: {
  //       type: [Number],
  //       validate: {
  //         validator: function (coords: number[]) {
  //           return (
  //             coords.length === 2 &&
  //             coords[0] >= -180 &&
  //             coords[0] <= 180 && // longitude
  //             coords[1] >= -90 &&
  //             coords[1] <= 90 // latitude
  //           );
  //         },
  //         message: 'Invalid coordinates',
  //       },
  //     },
  //   },
  //   // index: '2dsphere', // للـ geospatial queries
  // })
  // location?: {
  //   type: 'Point';
  //   coordinates: [number, number]; // [longitude, latitude]
  // };

  // ==================== IMAGES ====================
  @Prop({ type: String })
  logo?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  // ==================== FACILITIES & AMENITIES ====================
  @Prop({ type: [String], default: [] })
  facilities?: string[];

  @Prop({ type: Boolean, default: false })
  hasParking: boolean;

  @Prop({ type: Boolean, default: false })
  hasWifi: boolean;

  @Prop({ type: Boolean, default: false })
  hasPharmacy: boolean;

  @Prop({ type: Boolean, default: false })
  isWheelchairAccessible: boolean;

  // ==================== WORKING HOURS ====================
  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true },
        isClosed: { type: Boolean, default: false },
      },
    ],
    _id: false,
  })
  workingHours?: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];

  // ==================== DOCTORS ====================
  @Prop({ type: [Types.ObjectId], ref: 'Doctor', default: [] })
  doctors?: Types.ObjectId[];

  // ==================== SERVICES ====================
  @Prop({ type: [String], default: [] })
  services?: string[];

  // ==================== INSURANCE ====================
  @Prop({ type: [String], default: [] })
  acceptedInsuranceProviders?: string[];

  // ==================== RATINGS ====================
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews?: number;

  // ==================== STATUS ====================
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  // ==================== OWNER INFO ====================
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;

  @Prop({ type: String, unique: true, sparse: true })
  licenseNumber?: string;

  @Prop({ type: Date })
  licenseExpiryDate?: Date;

  // ==================== METADATA ====================
  @Prop({ type: Number, min: 1900, max: 2100 })
  establishedYear?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPatients?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalAppointments?: number;

  // ==================== SOFT DELETE ====================
  @Prop({ type: Date })
  deletedAt?: Date;
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);

// ==================== INDEXES ====================
ClinicSchema.index({ name: 'text', description: 'text' }); // Full-text search
ClinicSchema.index({ 'address.city': 1 });
ClinicSchema.index({ 'address.state': 1 });
ClinicSchema.index({ isActive: 1, isVerified: 1 });
ClinicSchema.index({ rating: -1 });
ClinicSchema.index({ deletedAt: 1 });

// Compound index للبحث
ClinicSchema.index({
  'address.city': 1,
  isActive: 1,
  rating: -1,
});

// ==================== VIRTUALS ====================
// Full address as string
ClinicSchema.virtual('fullAddress').get(function (this: ClinicDocument) {
  const addr = this.address;
  const parts = [
    addr.buildingNumber,
    addr.street,
    addr.city,
    addr.state,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual populate للـ doctors
ClinicSchema.virtual('doctorProfiles', {
  ref: 'Doctor',
  localField: 'doctors',
  foreignField: '_id',
});

// Doctor count
ClinicSchema.virtual('doctorCount').get(function (this: ClinicDocument) {
  return this.doctors?.length || 0;
});

// ==================== MIDDLEWARE ====================
// Soft delete filter
ClinicSchema.pre(['find', 'findOne'], function (next) {
  const query = this.getQuery();

  if (query.includeDeleted !== true) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }

  next();
});

// Validate working hours time format
ClinicSchema.pre('save', function (next) {
  if (!this.workingHours) return next();

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const hours of this.workingHours) {
    if (!timeRegex.test(hours.openTime) || !timeRegex.test(hours.closeTime)) {
      return next(new Error('Invalid time format. Use HH:MM format'));
    }

    if (!hours.isClosed && hours.openTime >= hours.closeTime) {
      return next(new Error('Close time must be after open time'));
    }
  }

  next();
});

// ==================== METHODS ====================
// Check if clinic is open on a specific day
ClinicSchema.methods.isOpenOnDay = function (
  this: ClinicDocument,
  dayOfWeek: number,
): boolean {
  if (!this.workingHours) return false;

  const dayHours = this.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
  return dayHours ? !dayHours.isClosed : false;
};

// Get working hours for a specific day
ClinicSchema.methods.getWorkingHours = function (
  this: ClinicDocument,
  dayOfWeek: number,
) {
  if (!this.workingHours) return null;
  return this.workingHours.find((h) => h.dayOfWeek === dayOfWeek) || null;
};

// Add doctor to clinic
ClinicSchema.methods.addDoctor = async function (
  this: ClinicDocument,
  doctorId: Types.ObjectId,
) {
  if (!this.doctors) {
    this.doctors = [];
  }

  if (!this.doctors.includes(doctorId)) {
    this.doctors.push(doctorId);
    await this.save();
  }

  return this;
};

// Remove doctor from clinic
ClinicSchema.methods.removeDoctor = async function (
  this: ClinicDocument,
  doctorId: Types.ObjectId,
) {
  if (!this.doctors) return this;

  this.doctors = this.doctors.filter(
    (id) => id.toString() !== doctorId.toString(),
  );
  await this.save();

  return this;
};

// Update rating
ClinicSchema.methods.updateRating = async function (
  this: ClinicDocument,
  newRating: number,
) {
  const totalReviews = this.totalReviews || 0;
  const currentRating = this.rating || 0;

  const newAverageRating =
    (currentRating * totalReviews + newRating) / (totalReviews + 1);

  this.rating = Number(newAverageRating.toFixed(2));
  this.totalReviews = totalReviews + 1;

  return await this.save();
};

// Soft delete
ClinicSchema.methods.softDelete = async function (this: ClinicDocument) {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

// Restore
ClinicSchema.methods.restore = async function (this: ClinicDocument) {
  this.deletedAt = undefined;
  this.isActive = true;
  return await this.save();
};

// ==================== STATIC METHODS ====================
// Find nearby clinics using geospatial query
ClinicSchema.statics.findNearby = async function (
  longitude: number,
  latitude: number,
  maxDistanceInMeters: number = 5000, // 5km default
  limit: number = 10,
) {
  return await this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceInMeters,
      },
    },
    isActive: true,
    deletedAt: { $exists: false },
  }).limit(limit);
};

export const ClinicModel = MongooseModule.forFeature([
  {
    name: Clinic.name,
    schema: ClinicSchema,
  },
]);