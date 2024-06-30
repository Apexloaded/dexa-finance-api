import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true, lowercase: true })
  paymentId: string;

  @Prop({ unique: true, select: false })
  paymentClaimHash: string;

  @Prop({ required: true, lowercase: true })
  from: string;

  @Prop()
  senderName: string;

  @Prop({ lowercase: true, required: true })
  recipient_email: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  tokenSymbol: string;

  @Prop({ required: true })
  tokenName: string;

  @Prop({ required: true, default: false })
  isClaimed: boolean;

  @Prop({ required: true, select: false })
  isRequest: boolean;

  @Prop({ required: true, default: false, select: false })
  isOnChain: boolean;

  @Prop()
  signature: string;

  @Prop({ default: false })
  isLinked: boolean;

  @Prop()
  remark: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
