import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { User, UserDocument as TDocument } from "../models";


@Injectable()
export class UserRepository extends DatabaseRepository<User> {
    constructor(
        @InjectModel(User.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}