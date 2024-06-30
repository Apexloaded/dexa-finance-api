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

export class PaymentRequestEvent extends PaymentSentEvent {
  expiresAt: string;
  constructor(payload: PaymentRequestEvent) {
    super(payload);
    this.sender = payload.sender;
    this.expiresAt = payload.expiresAt;
  }
}

export class PaymentClaimedEvent extends PaymentSentEvent {}

export class DepositedEvent {
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  createdAt: string;
  constructor(payload: DepositedEvent) {
    this.from = payload.from;
    this.to = payload.to;
    this.amount = payload.amount;
    this.tokenAddress = payload.tokenAddress;
    this.createdAt = payload.createdAt;
  }
}

export class TransferEvent {
  from: string;
  to: string;
  amount: string;
  createdAt: string;
  constructor(payload: TransferEvent) {
    this.from = payload.from;
    this.to = payload.to;
    this.amount = payload.amount;
    this.createdAt = payload.createdAt;
  }
}
