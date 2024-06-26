import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventTypes } from 'src/enums/events.enum';
import {
  SendClaimByEmail,
  SendOtpMail,
  SendPayWithEmail,
} from './events/email.events';

@Injectable()
export class EmailEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  sendOtpMail(payload: SendOtpMail) {
    const { to, otp } = payload;
    const event = new SendOtpMail();
    event.to = to;
    event.otp = otp;
    this.eventEmitter.emit(EventTypes.SendOtp, event);
  }

  sendPayWithEmail(payload: SendPayWithEmail) {
    const event = new SendPayWithEmail(payload);
    this.eventEmitter.emit(EventTypes.SendPayWithEmail, event);
  }

  sendClaimConfirmation(payload: SendClaimByEmail) {
    const event = new SendClaimByEmail(payload);
    this.eventEmitter.emit(EventTypes.SendClaimByEmail, event);
  }
}
