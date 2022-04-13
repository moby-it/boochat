import { Injectable } from '@nestjs/common';
import { MeetupsMappings } from '../meetups/mappings';
import { UserMappings } from '../users/mappings';
@Injectable()
export class Mapper {
  user = {
    fromDocumentToUser: UserMappings.fromDocumentToEntity,
    fromDocumentsToUsers: UserMappings.fromDocumentsToEntities
  };
  meetups = {
    fromDocumentToMeetup: MeetupsMappings.fromDocumentToEntity,
    fromDocumentsToMeetups: MeetupsMappings.fromDocumentsToEntities
  };
}