import { ActiveUsersService, AuthService, WsJwtGuard, WsServer } from '@boochat/application';
import { UserConnectedEvent, UserId } from '@boochat/domain';
import { WebsocketEventsEnum } from '@boochat/shared';
import { UseGuards } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*',
    allowedHeaders: '*'
  }
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  serverInitialized = false;
  @WebSocketServer()
  server!: Server;
  constructor(private authService: AuthService, private activeUsersService: ActiveUsersService, private eventBus: EventBus) {}
  handleDisconnect(socket: Socket) {
    const userId = socket.handshake.query['id'] as UserId;
    this.activeUsersService.remove(userId);
    console.log('Disconnected');
  }
  @UseGuards(WsJwtGuard)
  async handleConnection(socket: Socket) {
    const token = socket.handshake.query['token'] as string;
    const result = await this.authService.verify(token);
    if (!result) {
      console.error(`client with token ${token} failed to authenticate`);
      socket.disconnect(true);
      return;
    } else {
      console.log('client authenticated');
    }

    if (!this.serverInitialized) {
      this.setStaticWsServer();
      this.setUserListWsSubscription();
    }
    const userId = await this.authService.getUserId(token);
    this.activeUsersService.add(userId, socket.id);
    this.eventBus.publish(new UserConnectedEvent(userId, socket));
    console.log('Connected', userId);
  }
  private setStaticWsServer() {
    this.serverInitialized = true;
    WsServer.instance = this.server;
  }
  private setUserListWsSubscription() {
    this.activeUsersService.activeUsers$.subscribe((userList) => {
      WsServer.instance.emit(WebsocketEventsEnum.ACTIVE_USER_LIST, Array.from(userList.keys()));
    });
  }
}
