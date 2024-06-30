import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BillDocument = HydratedDocument<Bill>;

export enum BillStatus {
  Active = '0',
  Completed = '1',
}

export enum ParticipantType {
  Single = '0',
  Multiple = '1',
}

@Schema({ timestamps: true })
export class Bill {
  @Prop({ required: true, lowercase: true })
  creator: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  amount?: number;

  @Prop({ required: true, lowercase: true })
  billToken: string;

  @Prop({ enum: ParticipantType })
  participantType: ParticipantType;

  @Prop({ enum: BillStatus })
  status: BillStatus;

  @Prop()
  isFixedAmount?: boolean;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
