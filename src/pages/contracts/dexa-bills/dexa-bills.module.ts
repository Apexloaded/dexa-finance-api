import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DexaBillsService } from './dexa-bills.service';
import contractConfig from 'src/config/contract.config';
import { PaymentModule } from 'src/pages/payment/payment.module';

@Module({
  imports: [ConfigModule.forFeature(contractConfig), PaymentModule],
  providers: [DexaBillsService],
  exports: [DexaBillsService],
})
export class DexaBillsModule {}
