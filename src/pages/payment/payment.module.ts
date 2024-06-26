import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { EmailModule } from 'src/email/email.module';
import { PaymentEventEmitter } from './payment.emitter';
import { PaymentEventListener } from './payment.listener';
import { DexaPayModule } from '../contracts/dexa-pay/dexa-pay.module';
import { TwoFaModule } from '../two-fa/two-fa.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    EmailModule,
    forwardRef(() => DexaPayModule),
    TwoFaModule,
    ConfigModule
  ],
  controllers: [PaymentController, PaymentEventListener],
  providers: [PaymentService, PaymentEventEmitter],
  exports: [PaymentService, PaymentEventEmitter],
})
export class PaymentModule {}
