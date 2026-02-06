import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { Schedule, ScheduleDocument as TDocument } from "../models";


@Injectable()
export class ScheduleRepository extends DatabaseRepository<Schedule> {
    constructor(
        @InjectModel(Schedule.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}