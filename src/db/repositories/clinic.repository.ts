import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Clinic, ClinicDocument as TDocument } from "../models";


@Injectable()
export class ClinicRepository extends DatabaseRepository<Clinic> {
    constructor(
        @InjectModel(Clinic.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}