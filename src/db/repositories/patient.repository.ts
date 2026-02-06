import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Patient, PatientDocument as TDocument } from "../models";


@Injectable()
export class PatientRepository extends DatabaseRepository<Patient> {
    constructor(
        @InjectModel(Patient.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}