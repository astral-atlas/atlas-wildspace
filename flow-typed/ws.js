// @flow strict

/*::
declare module "ws" {
  import type { Server, IncomingMessage } from 'http';
  import type { Server as SServer, IncomingMessage as SIncomingMessage } from 'https';

  declare type WebSocketServerOptions = {

  } & (
    | {| port: number |}
    | {| server: Server | SServer |}
    | {| noServer: boolean |}
  )
  declare type WebSocketOptions = {
    origin?: string,
  }

  declare type WebSocketSendOptions = {
    binary?: boolean,
    compress?: boolean,
    fin?: boolean,
    mask?: boolean,
  }

  declare export class WebSocketServer {
    constructor(options: WebSocketServerOptions): WebSocketServer;
    addListener('connection', cb: (w: WebSocket, i: IncomingMessage | SIncomingMessage) => void): void;
    address(): { port: number, family: string, address: string };
    close(): void;
  }

  declare export class WebSocket {
    constructor(address: string | URL, protocols?: string[], options?: WebSocketOptions): void;

    addEventListener('message', cb: ({ data: Uint8Array, isBinary: boolean }) => void): void;
    addEventListener('ping', cb: ({ data: Uint8Array }) => void): void;
    addEventListener('pong', cb: ({ data: Uint8Array }) => void): void;
    addEventListener('open', cb: () => void): void;
    addEventListener('close', cb: () => void): void;
    removeEventListener('message', cb: ({ data: Uint8Array, isBinary: boolean }) => void): void;
    removeEventListener('open', cb: ({ data: Uint8Array, isBinary: boolean }) => void): void;
    removeEventListener('close', cb: ({ data: Uint8Array, isBinary: boolean }) => void): void;

    ping(number): void;
    
    close(code: number, reason: string): void;
    send(data: string | Uint8Array, options?: WebSocketSendOptions, cb?: (error?: Error) => void): void;
    +readyState: number,
  }
}
*/