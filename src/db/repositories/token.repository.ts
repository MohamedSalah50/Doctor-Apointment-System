import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Token, tokenDocument as TDocument } from '../models';

@Injectable()
export class TokenRepository extends DatabaseRepository<Token> {
  constructor(
    @InjectModel(Token.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
