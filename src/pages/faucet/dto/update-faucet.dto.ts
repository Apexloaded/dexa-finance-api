import { PartialType } from '@nestjs/mapped-types';
import { CreateFaucetDto } from './create-faucet.dto';

export class UpdateFaucetDto extends PartialType(CreateFaucetDto) {}
