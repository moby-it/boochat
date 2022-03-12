import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result, UserId } from "@oursocial/domain";
import { RoomsPersistenceService } from "@oursocial/persistence";
import { Socket } from "socket.io";

export class UserJoinsRoomCommand {
  constructor(public readonly socket: Socket, public readonly userId: UserId) {

  }
}
export type UserJoinsRoomCommandResult = Result<undefined>;
@CommandHandler(UserJoinsRoomCommand)
export class UserJoinsRoomCommandHandler implements ICommandHandler<UserJoinsRoomCommand>{
  constructor(private roomsService: RoomsPersistenceService) { }
  async execute({ socket, userId }: UserJoinsRoomCommand): Promise<UserJoinsRoomCommandResult> {
    try {
      const rooms = await this.roomsService.findByUserId(userId);
      rooms.forEach(room => socket.join(room.id));
      return Result.success();
    } catch (e) {
      return Result.fail();
    }

  }

}
