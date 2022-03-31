import { QueryBus } from "@nestjs/cqrs";
import { MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { GetUserByIdQuery, GetUserByIdQueryResult } from "@oursocial/application";
import { RoomEvent, RoomId, User, UserId } from "@oursocial/domain";
import { Server, Socket } from "socket.io";
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  constructor(private queryBus: QueryBus) { }
  async handleDisconnect(client: Socket) {
    const lastVisitedRoom = client.data.lastVisitedRoom;
    if (lastVisitedRoom?.roomId && lastVisitedRoom?.userId) {
      const { roomId, userId } = lastVisitedRoom;
      const user = await this.getUser(userId);
      if (user) {
        user.logRoomVisit(roomId, userId, new Date());
        user.commit();
        return;
      }
      return;
    }
    console.warn('Failed to log last room visit');
  }
  @SubscribeMessage('addUserToRoom')
  async addUserToRoom(@MessageBody('userId') userId: string, @MessageBody('roomId') roomId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.inviteUserToRoom(userId, roomId);
      user.commit();
    }
  }
  @SubscribeMessage('removeUserFromRoom')
  async removeUserFromRoom(@MessageBody('userId') userId: string, @MessageBody('roomId') roomId: string) {
    const user = await this.getUser(userId);
    if (user) {
      user.leaveRoom(roomId);
      user.commit();
    }
  }
  @SubscribeMessage('userClosedRoom')
  async userClosedRoom(
    @MessageBody('roomId') roomId: string,
    @MessageBody('userId') userId: string,
  ) {
    const user = await this.getUser(userId);
    if (user) {
      user.logRoomVisit(roomId, userId, new Date());
      user.commit();
    }
  }
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() createRoomEvent: RoomEvent): Promise<void> {
    const user = await this.getUser(createRoomEvent.userId);
    if (user) {
      user.createRoom(user.id, createRoomEvent.roomName, createRoomEvent.userIds);
      user.commit();
    } else {
      throw new WsException('Cannot create Room. User does not exists');
    }
  }
  private async getUser(userId: UserId): Promise<User | undefined> {
    const result = await this.queryBus.execute(new GetUserByIdQuery(userId)) as GetUserByIdQueryResult;
    if (result.failed) console.error(result.error);
    return result.props;
  }
}
