import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserDocument } from 'src/db';
import { IUser } from './user.interface';
import type { Request } from 'express';
import { tokenEnum } from '../enums';


export interface IToken {
  _id?: Types.ObjectId;

  jti: string;
  expiredAt: Date;

  createdBy: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface ICredentials {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest extends Request {
  credentials: ICredentials;
  user: UserDocument;
  decoded: JwtPayload;
  tokenType: tokenEnum.access;
}
