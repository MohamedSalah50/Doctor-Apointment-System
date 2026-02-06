import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IOtp, OtpEnum } from "src/common";
import { emailEmitter, generateHash } from "src/utils";


export type OtpDocument = HydratedDocument<Otp>;
@Schema({ timestamps: true, strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Otp implements IOtp {
    @Prop({ type: String, required: true })
    code: string;
    @Prop({ type: Date, required: true })
    expiresAt: Date;
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId;
    @Prop({ type: String, enum: OtpEnum, required: true })
    type: OtpEnum;

}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })


OtpSchema.pre("save", async function (this: OtpDocument & { wasNew: boolean, plainOtp: string }, next) {
    this.wasNew = this.isNew
    if (this.isModified("code")) {
        this.plainOtp = this.code;
        this.code = await generateHash(this.code)
        await this.populate([{ path: "createdBy", select: "email" }])
    }
    next()
})


OtpSchema.post("save", async function (doc, next) {

    const that = this as OtpDocument & { wasNew: boolean, plainOtp: string }
    if (that.wasNew && that.plainOtp) {
        emailEmitter.emit(doc.type, {
            to: (doc.createdBy as any).email,
            otp: that.plainOtp
        })
    }
    next()
})


export const OtpModel = MongooseModule.forFeature([{
    name: Otp.name,
    schema: OtpSchema
}])