import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendClaimByEmail,
  SendOtpMail,
  SendPayWithEmail,
  SendPaymentReqEmail,
} from './events/email.events';
import { encodeBase64, hexlify, toUtf8Bytes } from 'ethers';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  sendOTP(payload: SendOtpMail) {
    const { to, otp } = payload;
    return this.mailService.sendMail({
      from: '"Dexapay" <no_reply@apexloaded.com>',
      to: to,
      subject: `[Dexapay] USDT Deposit Successful.`,
      template: 'otp',
      context: {
        title: '',
        code: otp,
      },
    });
  }

  sendClaimByEmail(payload: SendClaimByEmail) {
    const { to, tokenSymbol, amount, date, wallet, token } = payload;
    return this.mailService.sendMail({
      from: '"Dexapay" <no_reply@apexloaded.com>',
      to: to,
      subject: `[Dexapay] ${amount} ${tokenSymbol} Claim Request Initiated - ${date}`,
      template: 'claim-confirmation',
      context: {
        title: 'Confirm Your Claim Request',
        code: token,
        amount,
        tokenSymbol,
        wallet,
      },
    });
  }
  sendPayWithEmail(payload: SendPayWithEmail) {
    const { to, sender, tokenSymbol, amount, date, paymentId } = payload;
    const base64 = encodeBase64(hexlify(toUtf8Bytes(paymentId)));
    const encodedUrl = encodeURIComponent(base64);
    return this.mailService.sendMail({
      from: '"Dexapay" <no_reply@apexloaded.com>',
      to: to,
      subject: `[Dexapay] ${tokenSymbol} Deposit Confirmed - ${date}.`,
      template: 'email-pay',
      context: {
        title: `${tokenSymbol} Deposit Successful`,
        claimUrl: `https://www.dexafi.xyz/claim/${encodedUrl}`,
        code: paymentId.toUpperCase(),
        sender,
        amount,
        tokenSymbol,
      },
    });
  }

  sendPaymentReqEmail(payload: SendPaymentReqEmail) {
    const {
      to,
      sender,
      tokenSymbol,
      amount,
      date,
      paymentId,
      remark,
      expires,
    } = payload;
    const base64 = encodeBase64(hexlify(toUtf8Bytes(paymentId)));
    const encodedUrl = encodeURIComponent(base64);
    return this.mailService.sendMail({
      from: '"Dexapay" <no_reply@apexloaded.com>',
      to: to,
      subject: `[Dexapay] Payment Request - ${date}.`,
      template: 'request-pay',
      context: {
        title: ` Payment Request`,
        requestUrl: `https://www.dexafi.xyz/pay/${encodedUrl}`,
        sender,
        amount,
        tokenSymbol,
        remark,
        expires,
      },
    });
  }
}
