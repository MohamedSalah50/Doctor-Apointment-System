import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Otp, OtpDocument as TDocument } from "../models";


@Injectable()
export class OtpRepository extends DatabaseRepository<Otp> {
    constructor(
        @InjectModel(Otp.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}