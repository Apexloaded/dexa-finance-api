import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventTypes } from 'src/enums/events.enum';
import { getErrorMsg } from 'src/helpers';
import {
  PaymentClaimedEvent,
  PaymentSentEvent,
} from './events/payments.events';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from './payment.service';
import { toUtf8String } from 'ethers';
import { AuthService } from '../auth/auth.service';

@Controller()
export class PaymentEventListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly pmService: PaymentService,
    private readonly authService: AuthService,
  ) {}
  /**
   * @EventListener listens to event @PaymentSentEvent
   * This updates the status of the payment document and sends
   * an email to the recipient of the payment.
   * @param PaymentSentEvent
   */
  @OnEvent(EventTypes.PaymentSent, { async: true })
  async listenToPaymentSent(payload: PaymentSentEvent) {
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
        await this.authService.increaseTxCount(payment.from);
      }
    } catch (error: any) {
      getErrorMsg(error);
    }
  }

  /**
   * @EventListener listens to event @PaymentClaimedEvent
   * This updates the status of the payment document to clamied
   * @param PaymentClaimedEvent
   */
  @OnEvent(EventTypes.PaymentClaimed, { async: true })
  async listenToPaymentClaim(payload: PaymentClaimedEvent) {
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
