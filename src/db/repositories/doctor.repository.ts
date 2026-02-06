import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Doctor, DoctorDocument as TDocument } from "../models";


@Injectable()
export class DoctorRepository extends DatabaseRepository<Doctor> {
    constructor(
        @InjectModel(Doctor.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}