import { CreateMeetupEvent } from '@boochat/domain';
import { MeetupEventStoreService } from '@boochat/persistence';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventBusService } from '../../event-bus/event-bus.service';

@EventsHandler(CreateMeetupEvent)
export class MeetupCreatedEventHandler implements IEventHandler<CreateMeetupEvent> {
  constructor(private meetupStore: MeetupEventStoreService, private eventBus: EventBusService) {}
  async handle(event: CreateMeetupEvent) {
    await this.meetupStore.create(event);
    await this.eventBus.emitMeetupEvent(event);
  }
}