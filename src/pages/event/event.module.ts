import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventGateway } from './event.gateway';
import { PaymentModule } from '../payment/payment.module';
import { EmailModule } from 'src/email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PaymentModule, EmailModule, AuthModule],
  providers: [EventGateway, EventService],
  exports: [EventGateway],
})
export class EventModule {}
