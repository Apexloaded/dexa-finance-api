import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventTypes } from 'src/enums/events.enum';
import { PaymentClaimedEvent, PaymentSentEvent } from './events/payments.events';

@Injectable()
export class PaymentEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitPaymentSent(payload: PaymentSentEvent) {
    const event = new PaymentSentEvent(payload);
    this.eventEmitter.emit(EventTypes.PaymentSent, event);
  }

  emitPaymentClaimed(payload: PaymentClaimedEvent) {
    const event = new PaymentClaimedEvent(payload);
    this.eventEmitter.emit(EventTypes.PaymentClaimed, event);
  }
}
