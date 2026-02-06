import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, IUser, RoleEnum } from 'src/common';
import { generateHash } from 'src/utils';

export type UserDocument = HydratedDocument<User> & {
  actualMobileNumber?: string | null;
};
@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({ required: true, minlength: 7, maxlength: 50 })
  fullName: string;

  @Prop({ required: true, minlength: 7, maxlength: 20 })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, sparse: true }) // sparse: true = يسمح بـ null وunique في نفس الوقت
  phoneNumber?: string;

  @Prop({ type: Boolean, default: false })
  isPhoneVerified?: boolean;

  //profile

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String, enum: GenderEnum })
  gender?: GenderEnum;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  //role&status

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: RoleEnum.patient, enum: RoleEnum })
  role: RoleEnum;

  @Prop({ type: Boolean, default: false })
  isEmailVerified?: boolean;

  //security

  @Prop({ type: Date })
  changeCredentialTime: Date;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  //soft delete
  @Prop({ required: false }) 
  freezedAt?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ freezedAt: 1 });

UserSchema.virtual('patientProfile', {
  ref: 'Patient',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Virtual populate للـ Doctor data
UserSchema.virtual('doctorProfile', {
  ref: 'Doctor',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Virtual للعمر
UserSchema.virtual('age').get(function (this: UserDocument) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
 
    return age;
  }
  return null;
});

// ==========================

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
  next();
});

UserSchema.pre(['findOne', 'find'], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
