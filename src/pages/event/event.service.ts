import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaymentClaimedEvent, PaymentRequestEvent, PaymentSentEvent } from '../payment/events/payments.events';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from '../payment/payment.service';
import { toUtf8String } from 'ethers';
import { getErrorMsg } from 'src/helpers';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';

@Injectable()
export class EventService {
  constructor(
    private readonly emailService: EmailService,
    private readonly pmService: PaymentService,
    private readonly authService: AuthService,
  ) {}
  async initPaymentRequest(payload: PaymentRequestEvent) {
    try {
      const recipient = toUtf8String(payload.email);
      const payId = toUtf8String(payload.paymentCode);
      const payment = await this.pmService.findOne({
        recipient_email: recipient,
        paymentId: payId,
        isOnChain: false,
        isClaimed: false,
      });
      if (payment) {
        payment.isOnChain = true;
        payment.save();

        const emailPayload = {
          to: recipient,
          sender: payment.senderName,
          amount: `${payment.amount}`,
          tokenSymbol: payment.tokenSymbol,
          date: new Date().toUTCString(),
          paymentId: payment.paymentId,
          expires: moment().add(3, 'days').toDate().toUTCString(),
          remark: payment.remark,
        };
        const email = await this.emailService.sendPaymentReqEmail(emailPayload);
        console.log(email);
        await this.authService.increaseTxCount(payment.from);
      }
    } catch (error: any) {
      getErrorMsg(error);
    }
  }

  async initPaymentSent(payload: PaymentSentEvent) {
    try {
      const recipient = toUtf8String(payload.email);
      const payId = toUtf8String(payload.paymentCode);
      const payment = await this.pmService.findOne({
        recipient_email: recipient,
        paymentId: payId,
        isOnChain: false,
        isClaimed: false,
      });
      if (payment) {
        payment.isOnChain = true;
        payment.save();

        const emailPayload = {
          to: recipient,
          sender: payment.senderName,
          amount: `${payment.amount}`,
          tokenSymbol: payment.tokenSymbol,
          date: new Date().toUTCString(),
          paymentId: payment.paymentId,
        };
        const email = await this.emailService.sendPayWithEmail(emailPayload);
        console.log(email);
        await this.authService.increaseTxCount(payment.from);
      }
    } catch (error: any) {
      getErrorMsg(error);
    }
  }

  async initPaymentClaimed(payload: PaymentClaimedEvent) {
    try {
      const recipient = toUtf8String(payload.email);
      const payId = toUtf8String(payload.paymentCode);
      const payment = await this.pmService.findOne({
        recipient_email: recipient,
        paymentId: payId,
        isOnChain: false,
        isClaimed: false,
      });
      if (payment) {
        payment.isClaimed = true;
        payment.save();
      }
    } catch (error: any) {
      getErrorMsg(error);
    }
  }

}
