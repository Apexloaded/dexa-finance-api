import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Server, Socket } from 'socket.io';
import { SocketEvents } from './events/socket.event';
import {
  PaymentClaimedEvent,
  PaymentRequestEvent,
  PaymentSentEvent,
} from '../payment/events/payments.events';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from '../payment/payment.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly eventService: EventService) {}

  @SubscribeMessage(SocketEvents.Connected)
  handleConnection(client: Socket) {
    console.log('connected');
    const userId = client.handshake.query.userId;
    if (userId) {
      const r = client.join(userId);
    }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, userId: string) {
    client.join(userId);
  }

  @SubscribeMessage(SocketEvents.PaymentRequested)
  onPaymentRequest(@MessageBody() body: PaymentRequestEvent) {
    this.eventService.initPaymentRequest(body);
  }

  @SubscribeMessage(SocketEvents.PaymentSent)
  onPaymentSent(@MessageBody() body: PaymentSentEvent) {
    this.eventService.initPaymentSent(body);
  }

  @SubscribeMessage(SocketEvents.PaymentClaimed)
  onPaymentClaimed(@MessageBody() body: PaymentClaimedEvent) {
    this.eventService.initPaymentClaimed(body);
  }
}
