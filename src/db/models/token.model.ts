import { MongooseModule, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IToken } from 'src/common';

export class Token implements IToken {
  @Prop({ type: String, required: true, unique: true })
  jti: string;

  @Prop({ type: Date, required: true })
  expiredAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export type tokenDocument = HydratedDocument<Token>;

export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = MongooseModule.forFeature([
  { name: Token.name, schema: TokenSchema },
]);
