export class SendOtpMail {
  to: string;
  otp: string;
}

export class SendPayWithEmail {
  to: string;
  sender: string;
  amount: string;
  tokenSymbol: string;
  date: string;
  paymentId: string;

  constructor(payload: SendPayWithEmail) {
    this.to = payload.to;
    this.sender = payload.sender;
    this.amount = payload.amount;
    this.tokenSymbol = payload.tokenSymbol;
    this.date = payload.date;
    this.paymentId = payload.paymentId;
  }
}

export class SendClaimByEmail extends SendPayWithEmail {
  wallet: string;
  token: string;
  constructor(payload: SendClaimByEmail) {
    super(payload);
    this.wallet = payload.wallet;
    this.token = payload.token;
  }
}

export class SendPaymentReqEmail extends SendPayWithEmail {
  remark: string;
  expires: string;
  constructor(payload: SendPaymentReqEmail) {
    super(payload);
    this.remark = payload.remark;
    this.expires = payload.expires;
  }
}
