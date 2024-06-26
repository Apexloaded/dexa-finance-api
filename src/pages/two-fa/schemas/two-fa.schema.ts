import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TwoFactorDocument = HydratedDocument<TwoFactor>;

@Schema({ timestamps: true })
export class TwoFactor {
  @Prop({ required: true, lowercase: true })
  senderWallet: string;

  @Prop({ lowercase: true })
  email: string;

  @Prop({ unique: true })
  token: string;

  @Prop()
  expiresAt: Date;

  @Prop({ default: false })
  isVerified?: boolean;
}

export const TwoFactorSchema = SchemaFactory.createForClass(TwoFactor);
