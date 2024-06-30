import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ParticipantType } from '../schemas/bill.schema';

export class CreateBillDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  amount?: number;

  @IsString()
  billToken: string;

  @IsEnum(ParticipantType)
  participantType: ParticipantType;

  isFixedAmount?: boolean;
}
