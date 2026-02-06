import { Types } from "mongoose";
import { OtpEnum } from "../enums";

export interface IOtp {

    _id?: Types.ObjectId;


    code: string,
    expiresAt: Date;
    createdBy: Types.ObjectId;
    type: OtpEnum;

    createdAt?: Date;
    updatedAt?: Date;

}