export enum RoomEventEnum {
  ROOM_CREATED = 1,
  USER_JOINED_ROOM,
  USER_LEFT_ROOM,
  USER_CLOSED_ROOM,
  USER_SENT_MESSAGE,
}
export type RoomEventType = keyof typeof RoomEventEnum;
