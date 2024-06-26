import { IsString } from 'class-validator';
import { SiweMessage } from 'siwe';

export class VerifyNonceDto {
  message: string;

  signature: `0x${string}`;

  wallet: `0x${string}`;
}
