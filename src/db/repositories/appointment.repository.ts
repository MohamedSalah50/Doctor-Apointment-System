import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Appointment, AppointmentDocument as TDocument } from "../models";


@Injectable()
export class AppointmentRepository extends DatabaseRepository<Appointment> {
    constructor(
        @InjectModel(Appointment.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}