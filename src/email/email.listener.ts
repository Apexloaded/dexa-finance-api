import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventTypes } from 'src/enums/events.enum';
import { getErrorMsg } from 'src/helpers';
import { EmailService } from './email.service';
import { SendClaimByEmail, SendOtpMail, SendPayWithEmail } from './events/email.events';

@Controller()
export class EmailEventListener {
  constructor(private readonly emailService: EmailService) {}

  /**
   * @EventListener listens to event @SendOtp
   * This sends an otp email to the user
   * @param SendOtpMail
   */
  @OnEvent(EventTypes.SendOtp, { async: true })
  async sendOtp(payload: SendOtpMail) {
    try {
      const email = await this.emailService.sendOTP(payload);
      console.log(email);
    } catch (error: any) {
      console.log(error);
      getErrorMsg(error);
    }
  }

  /**
   * @EventListener listens to event @SendPayWithEmail
   * This sends an otp email to the user
   * @param SendPayWithEmailMail
   */
  @OnEvent(EventTypes.SendPayWithEmail, { async: true })
  async sendPayWithEmail(payload: SendPayWithEmail) {
    try {
      const email = await this.emailService.sendPayWithEmail(payload);
      console.log(email);
    } catch (error: any) {
      console.log(error);
      getErrorMsg(error);
    }
  }

  @OnEvent(EventTypes.SendClaimByEmail, { async: true })
  async listenToSendByEmailClaimEv(payload: SendClaimByEmail) {
    try {
      const email = await this.emailService.sendClaimByEmail(payload);
      console.log(email);
    } catch (error: any) {
      console.log(error);
      getErrorMsg(error);
    }
  }
}
