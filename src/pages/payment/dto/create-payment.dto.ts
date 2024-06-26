import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  recipient_email: string;

  @IsNumber()
  amount: number;

  @IsString()
  tokenAddress: string;

  @IsString()
  tokenSymbol: string;

  @IsString()
  tokenName: string;

  from?: string;

  paymentId?: string;

  paymentClaimHash?: string;

  senderName?: string;

  isRequest?: boolean;
}

export class ClaimPaymentByEmailDto {
  @IsString()
  email: string;

  @IsString()
  paymentCode: string;

  @IsString()
  ownerAddress: string;
}

export class VerifyOtpDto extends ClaimPaymentByEmailDto {
  @IsString()
  otp: string;
}
