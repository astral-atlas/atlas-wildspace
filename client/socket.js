// @flow strict
/*:: import type { AuthDetails } from './auth'; */
/*:: import type { JSONValue } from './json'; */
/*:: import type { AuthenticationRequest } from '@astral-atlas/wildspace-models'; */
const { toAuthenticationResponse, toAuthenticationGrant } = require('@astral-atlas/wildspace-models');
/*::
export type Connection<ServerEvent, ClientEvent> = {
  send: (event: ClientEvent) => void,
  addEventListener: (listener: (event: ServerEvent) => mixed) => { remove: () => void },
  open: () => Promise<void>,
  close: () => void,
};

export type SocketClient = {
  connect: <ServerEvent: JSONValue, ClientEvent: JSONValue>(
    path: string,
    query: { [string]: string },
    toSeverEvent: mixed => ServerEvent,
    requiresAuthentication?: boolean,
  ) => Connection<ServerEvent, ClientEvent>;
};
*/

const createSocketClient = (endpoint/*: URL*/, auth/*: ?AuthDetails*/)/*: SocketClient*/ => {
  const authenticateSocket = async (socket) => {
    if (!auth)
      return;

    const authRequest/*: AuthenticationRequest*/ = {
      user: auth.user,
      secret: auth.secret,
      type: 'request-authentication',
    };
    socket.send(JSON.stringify(authRequest));
    const message = await new Promise((res) => {
      const onMessage = (message/*: MessageEvent*/) =>
        (socket.removeEventListener('message', onMessage), res(message));
      socket.addEventListener('message', onMessage);
    });
    if (typeof message.data !== 'string')
      throw new TypeError();
    const authEvent = toAuthenticationResponse(JSON.parse(message.data));
    switch (authEvent.type) {
      default:
      case 'deny-authentication':
        socket.close();
        throw new Error('Socket authentication denied');
      case 'grant-authentication':
        return;
    }
  };
  const openSocket = async (socket) => {
    await new Promise((res) => {
      const onOpen = () =>
        (socket.removeEventListener('open', onOpen), res());
      socket.addEventListener('open', onOpen);
    });
  };
  const connect = /*::<ServerEvent: JSONValue, ClientEvent: JSONValue>*/(
    path/*: string*/,
    query/*: { [string]: string }*/,
    toSeverEvent/*: mixed => ServerEvent*/,
    requiresAuthentication/*: boolean*/ = true,
  )/*: Connection<ServerEvent, ClientEvent>*/ => {
    let socket = null;
    const onReceiveListeners = new Set();
  
    if (requiresAuthentication && !auth)
      throw new Error('Cannot open socket: missing authentication');
  
    const url = new URL(path, endpoint);
    url.search = '?' + new URLSearchParams(query).toString();

    
    const open = async () => {
      socket = new WebSocket(url.href);
      await openSocket(socket);
  
      if (requiresAuthentication)
        await authenticateSocket(socket);
  
      socket.addEventListener('message', (message/*: MessageEvent*/) => {
        const data = message.data;
        if (typeof data !== 'string')
          throw new TypeError();
        const event = toSeverEvent(JSON.parse(data));
        for (const listener of onReceiveListeners)
          listener(event);
      });
    };
    const send = (event) => {
      socket && socket.send(JSON.stringify(event));
    };
    const addEventListener = (listener) => {
      onReceiveListeners.add(listener);
      return {
        remove: () => void onReceiveListeners.delete(listener),
      };
    }
    const close = () => {
      socket && socket.close();
    };

    return {
      open,
      send,
      addEventListener,
      close,
    };
  };

  return {
    connect,
  };
};

module.exports = {
  createSocketClient,
};