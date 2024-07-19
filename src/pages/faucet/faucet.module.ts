import { Module } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { FaucetController } from './faucet.controller';
import { DexaPayModule } from '../contracts/dexa-pay/dexa-pay.module';

@Module({
  imports: [DexaPayModule],
  controllers: [FaucetController],
  providers: [FaucetService],
})
export class FaucetModule {}
