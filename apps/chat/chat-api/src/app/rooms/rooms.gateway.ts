import { CommandBus } from "@nestjs/cqrs";
import { MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { AddUserToRoomCommand, AddUserToRoomCommandResult, ConnectUsersToRoomCommand, ConnectUsersToRoomResult, DisconnectUsersFromRoomCommand, DisconnectUsersFromRoomResult, RemoveUserFromRoomCommand, RemoveUserFromRoomCommandResult, SaveUserLastRoomVisitCommand } from "@oursocial/application";
import { Result } from "@oursocial/domain";
import { LastRoomVisitDto } from "@oursocial/persistence";
import { Server, Socket } from "socket.io";
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  constructor(private commandBus: CommandBus) { }
  async handleDisconnect(client: Socket) {
    const lastVisitedRoom = client.data.lastVisitedRoom as LastRoomVisitDto;
    if (lastVisitedRoom?.roomId && lastVisitedRoom?.timestamp && lastVisitedRoom?.userId) {
      const { roomId, userId, timestamp } = lastVisitedRoom;
      const result = await this.commandBus.execute(new SaveUserLastRoomVisitCommand(roomId, userId, timestamp)) as Result;
      if (result.failed) { console.error(result.error); };
    }
    console.log('invalid last visited room on disconnect');
  }
  @SubscribeMessage('addUserToRoom')
  async addUserToRoom(@MessageBody('userId') userId: string, @MessageBody('roomId') roomId: string): Promise<void> {
    // should be event
    const addUserResult = await this.commandBus.execute(new AddUserToRoomCommand(userId, roomId)) as AddUserToRoomCommandResult;
    if (addUserResult.failed) console.error(addUserResult.error);

    const connectUsersResult = await this.commandBus.execute<ConnectUsersToRoomCommand, ConnectUsersToRoomResult>(new ConnectUsersToRoomCommand([userId], roomId));
    if (connectUsersResult.failed) console.error(connectUsersResult.error);
  }
  @SubscribeMessage('removeUserFromRoom')
  async removeUserFromRoom(@MessageBody('userId') userId: string, @MessageBody('roomId') roomId: string) {
    // should be event
    const result = await this.commandBus.execute(new RemoveUserFromRoomCommand(userId, roomId)) as RemoveUserFromRoomCommandResult;
    if (result.failed) console.error(result.error);

    const disconnectUsersResult = await this.commandBus.execute<DisconnectUsersFromRoomCommand, DisconnectUsersFromRoomResult>(new DisconnectUsersFromRoomCommand(this.server, [userId], roomId));
    if (disconnectUsersResult.failed) console.error(disconnectUsersResult.error);
  }
  @SubscribeMessage('userClosedRoom')
  async userClosedRoom(
    @MessageBody('roomId') roomId: string,
    @MessageBody('userId') userId: string,
  ) {
    // should be event
    const result = await this.commandBus.execute(new SaveUserLastRoomVisitCommand(roomId, userId, new Date())) as Result;
    if (result.failed) { console.error(result.error); };
  }
}
