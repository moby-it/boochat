import { Meetup, Room, RoomItem, User } from '@boochat/domain';
import { QuerySocketEventsEnum } from '@boochat/shared';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { appendRoomItem, setRoomList } from '../store/rooms';
import { AppDispatch } from '../store/store';
import { setActiveUsers, setUsers } from '../store/users/users.reducer';
import { NotificationService } from './notification-service';
interface ISocketManager {
  initializeSocketManager: (dispatch: AppDispatch, token: string) => void;
  querySocket: Socket | undefined;
  commandSocket: Socket | undefined;
}
const SocketManager: ISocketManager = {
  initializeSocketManager,
  querySocket: undefined,
  commandSocket: undefined
};
function initializeQuerySocketEventListeners(dispatch: AppDispatch) {
  SocketManager.querySocket?.on(QuerySocketEventsEnum.ALL_USERS, (users: User[]) => {
    console.log('ALL USERS', users);
    dispatch(setUsers(users));
  });
  SocketManager.querySocket?.on(QuerySocketEventsEnum.ACTIVE_USER_LIST, (activeUsers: string[]) => {
    console.log('ACTIVE USERS', activeUsers);
    dispatch(setActiveUsers(activeUsers));
  });
  SocketManager.querySocket?.on(QuerySocketEventsEnum.MEETUP_LIST, (meetups: Meetup[]) => {
    console.log('MEETUPS LIST', meetups);
  });
  SocketManager.querySocket?.on(QuerySocketEventsEnum.ROOM_LIST, (rooms: Room[]) => {
    console.log('ROOMS LIST', rooms);
    dispatch(setRoomList(rooms));
  });
  SocketManager.querySocket?.on(QuerySocketEventsEnum.NEW_ROOM_ITEM, (item: RoomItem) => {
    dispatch(appendRoomItem(item));
    NotificationService.notify();
  });
}
function initializeSocketManager(dispatch: AppDispatch, token: string) {
  if (!SocketManager.querySocket) {
    SocketManager.querySocket = io(environment.queryApiUrl + `?token=${token}`, {
      transports: ['websocket']
    }).connect();
    initializeQuerySocketEventListeners(dispatch);
  }
  if (!SocketManager.commandSocket)
    SocketManager.commandSocket = io(environment.commandApiUrl + `?token=${token}`, {
      transports: ['websocket']
    }).connect();
}

export default SocketManager;
