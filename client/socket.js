// @flow strict
/*:: import type { AuthDetails } from './auth'; */
/*:: import type { JSONValue } from './json'; */
/*:: import type { AuthenticationRequest } from '@astral-atlas/wildspace-models'; */
const { toAuthenticationResponse } = require('@astral-atlas/wildspace-models');
/*::
type Connection<SendType: JSONValue> = {
  send: (value: SendType) => void,
  socket: WebSocket,
};

export type SocketClient = {
  connect: <SendType: JSONValue, ReceiveType>(
    path: string,
    query: { [string]: string },
    onReceive: ReceiveType => mixed,
    toReceiveType: mixed => ReceiveType
  ) => Promise<Connection<SendType>>;
};
*/

const createSocketClient = (endpoint/*: URL*/, auth/*: ?AuthDetails*/)/*: SocketClient*/ => {
  const connect = async /*::<S: JSONValue, R>*/(
    path/*: string*/,
    query/*: { [string]: string }*/,
    onReceive/*: R => mixed*/,
    toReceiveType/*: mixed => R*/
  )/*: Promise<Connection<S>>*/ => {
    const url = new URL(path, endpoint);
    url.search = '?' + new URLSearchParams(Object.entries(query)).toString();
    const socket = new WebSocket(url.href);
    await new Promise(res => {
      const onOpen = () => {
        socket.removeEventListener('open', onOpen);
        res();
      }
      socket.addEventListener('open', onOpen);
    });

    if (auth) {
      const authRequest/*: AuthenticationRequest*/ = {
        user: auth.user,
        secret: auth.secret,
        type: 'request-authentication',
      };
      socket.send(JSON.stringify(authRequest));

      await new Promise((res, rej) => {
        const onMessage = (message/*: MessageEvent*/) => {
          socket.removeEventListener('message', onMessage);
          const data = message.data;
          if (typeof data !== 'string')
            return rej(new Error(`wtf`));
          
          const event = toAuthenticationResponse(JSON.parse(data));
          switch (event.type) {
            default:
            case 'deny-authentication':
              console.error(event);
              return rej(new Error(`Denied Auth`));
            case 'grant-authentication':
              console.log(event);
              return res();
          }
        };
        socket.addEventListener('message', onMessage);
      });
    }

    socket.addEventListener('message', (message/*: MessageEvent*/) => {
      const data = message.data;
      if (typeof data !== 'string')
        throw new TypeError();
      const event = toReceiveType(JSON.parse(data));
      onReceive(event);
    });
    
    const send = (event) => {
      socket.send(JSON.stringify(event));
    };

    return {
      send,
      socket,
    };
  };

  return {
    connect,
  };
};

module.exports = {
  createSocketClient,
};