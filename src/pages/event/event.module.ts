import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventGateway } from './event.gateway';

@Module({
  imports: [],
  providers: [EventGateway, EventService],
  exports: [EventGateway],
})
export class EventModule {}
