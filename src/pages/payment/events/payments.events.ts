export class PaymentSentEvent {
  paymentCode: string;
  sender: string;
  email: string;
  amount: string;

  constructor(payload: PaymentSentEvent) {
    this.paymentCode = payload.paymentCode;
    this.sender = payload.sender;
    this.amount = payload.amount;
    this.email = payload.email;
  }
}

export class PaymentClaimedEvent extends PaymentSentEvent {}
