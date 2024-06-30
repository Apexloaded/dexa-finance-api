import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventTypes } from 'src/enums/events.enum';
import {
  DepositedEvent,
  PaymentClaimedEvent,
  PaymentRequestEvent,
  PaymentSentEvent,
  TransferEvent,
} from './events/payments.events';

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

  emitFundDeposit(payload: DepositedEvent) {
    const event = new DepositedEvent(payload);
    this.eventEmitter.emit(EventTypes.Deposited, event);
  }

  emitFundTransfer(payload: TransferEvent) {
    const event = new TransferEvent(payload);
    this.eventEmitter.emit(EventTypes.Transfer, event);
  }

  emitPaymentRequest(payload: PaymentRequestEvent) {
    const event = new PaymentRequestEvent(payload);
    this.eventEmitter.emit(EventTypes.RequestPayment, event);
  }
}
