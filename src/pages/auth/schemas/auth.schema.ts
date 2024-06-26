import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Auth>;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true, lowercase: true })
  wallet: string;

  @Prop()
  nonce?: string;

  @Prop({ default: 0 })
  txCount?: number;

  @Prop()
  lastTxDate: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
