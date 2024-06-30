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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway {
  @WebSocketServer() server: Server;
  constructor(
    private readonly eventService: EventService,
  ) {}

  @SubscribeMessage('connect')
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      const r = client.join(userId);
    }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, userId: string) {
    client.join(userId);
  }

  @SubscribeMessage('createEvent')
  create(@MessageBody() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @SubscribeMessage('findAllEvent')
  findAll() {
    return this.eventService.findAll();
  }

  @SubscribeMessage('findOneEvent')
  findOne(@MessageBody() id: number) {
    return this.eventService.findOne(id);
  }

  @SubscribeMessage('updateEvent')
  update(@MessageBody() updateEventDto: UpdateEventDto) {
    return this.eventService.update(updateEventDto.id, updateEventDto);
  }

  @SubscribeMessage('removeEvent')
  remove(@MessageBody() id: number) {
    return this.eventService.remove(id);
  }
}
