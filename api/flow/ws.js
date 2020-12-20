// @flow strict
/*::
declare module "ws" {
  import type { Server as HTTPServer, IncomingMessage } from 'http';

  declare class Server {
    on(event: 'connection', (socket: WebSocket, request: IncomingMessage) => mixed): void;
    close(code: number, message: string): void;

    constructor({ server: HTTPServer }): Server;
  }
  declare class WebSocket {
    once(event: 'message', (data: string) => mixed): void;
    on(event: 'message', (data: string) => mixed): void;
    on(event: 'close', () => mixed): void;
    on(event: 'open', () => mixed): void;
    send(data: any): void;
    close(code: number, message: string): void;

    static Server: typeof Server;
  }

  declare module.exports: typeof WebSocket;
}
*/