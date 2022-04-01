import { Server } from 'socket.io';

export class WsServer {
  private static _instance: Server;
  public static get instance(): Server {
    if (!this._instance) throw new Error('cannot access ws server before set');
    return this._instance;
  }
  public static set instance(value: Server) {
    if (!this._instance && value) this._instance = value;
  }
}
