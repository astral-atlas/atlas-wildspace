// @flow strict
/*:: import type { ResourceRequest } from '@lukekaalim/server'; */
/*:: import { IncomingMessage, Server as HTTPServer } from 'http'; */
/*:: import type { Services } from './services'; */
const { getResourceRequest, createRouteRequest } = require('@lukekaalim/server')

const WebSocket = require('ws');

/*::
export type WSConnection = {
  ...ResourceRequest,
  socket: WebSocket,
};

export type WSHandler = (connection: WSConnection) => mixed;
export type WSRoute = {
  path: string,
  handler: WSHandler,
};

export type WSListener = (connection: WebSocket, incoming: IncomingMessage) => void;
*/

const createWebSocketServer = (httpServer/*: HTTPServer*/, listener/*: WSListener*/)/*: WebSocket.Server*/ => {
  const socketServer = new WebSocket.Server({ server: httpServer });
  socketServer.on('connection', listener);
  return socketServer;
};

const createWSListener = (routes/*: WSRoute[]*/)/*: WSListener*/ => {
  const listener = async (socket, incoming) => {
    try {
      const routeRequest = createRouteRequest(incoming);
      const resourceRequest = await getResourceRequest(routeRequest);

      const route = routes.find(route => route.path === resourceRequest.path);
      if (!route)
        return socket.close(1002, 'No route for path found');
      
      const connection = {
        ...resourceRequest,
        socket,
      };
      return route.handler(connection);
    } catch (error) {
      console.error(error);
      socket.close(1011, error.message);
    }
  };
  return (s, i) => void listener(s, i);
};

const createWSRoute = (path/*: string*/, handler/*: WSHandler*/)/*: WSRoute*/ => ({
  path,
  handler,
});

module.exports = {
  createWebSocketServer,
  createWSListener,
  createWSRoute,
}