// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { ResourceRequest, RouteResponse, Route as HTTPRoute } from '@lukekaalim/server';*/
/*:: import type { APIEndpoint, Channel, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { APIRoute } from '../routes';*/
/*:: import type { WSRoute, WSConnection } from '../socket';*/
/*:: import type { Services } from '../services';*/
const { toAuthenticationRequest } = require('@astral-atlas/wildspace-models/auth');
const { createJSONResponse } = require('@lukekaalim/server');
const { getResponseForError } = require('../errors');

const ws = (wsRoute/*: WSRoute*/)/*: APIRoute*/ => ({
  protocol: 'ws',
  wsRoute
});
const http = (httpRoute/*: HTTPRoute*/)/*: APIRoute*/ => ({
  protocol: 'http',
  httpRoute,
});

/*::
type Handler = ResourceRequest => Promise<RouteResponse>;

export type {
  Handler,
};
*/

const withErrorHandling = (
  handler/*: Handler*/
)/*: Handler*/ => async (req) => {
  try {
    return await handler(req);
  } catch (error) {
    return getResponseForError(error);
  }
};

/*::
type StructureRequest<T> = {
  ...ResourceRequest,
  content: { type: 'json', value: T }
};
*/

const streamToBuffer = (stream/*: Readable*/, length/*: number*/)/*: Promise<Buffer>*/ => {
  const promise = new Promise((resolve, reject) => {
    let offset = 0;
    const buffer = Buffer.alloc(length);
    stream.on('data', (chunk/*: Buffer*/) => {
      chunk.copy(buffer, offset);
      offset += chunk.byteLength;
    });
    stream.on('end', () => resolve(buffer))
  });
  
  return promise;
};

const createAPIEndpointHandler = /*:: <RQ: JSONValue, RS: JSONValue, Q: { [string]: string }> */(
  endpoint/*: APIEndpoint<RQ, RS, Q>*/,
  handler/*: (query: Q, body: RQ, request: ResourceRequest) => Promise<[number, RS]>*/,
)/*: Handler*/ => {
  const getHandler = async (request) => {
    const { validateJSON, query } = request;
     const [status, response] = await handler(endpoint.toQuery(query), endpoint.toRequestBody(), request);
     return createJSONResponse(status, response);
  };
  const postHandler = async (request) => {
    const { validateJSON, query } = request;
    const requestBody = await validateJSON(endpoint.toRequestBody);
    const [status, response] = await handler(endpoint.toQuery(query), requestBody, request);
    return createJSONResponse(status, response);
  };
  switch (endpoint.method) {
    case 'POST':
      return postHandler;
    case 'GET':
      return getHandler;
  }
};

/*::
type ChannelConnection<ServerEvent, Query: {}> = {
  ...WSConnection,
  query: Query,
  user: User,
  send: (event: ServerEvent) => mixed,
  disconnect: (code?: number, reason?: string) => mixed,
};

type ChannelHandler<ClientEvent> = {
  onReceiveEvent: (event: ClientEvent) => mixed,
  onDisconnect: () => mixed,
  onSetupComplete: () => mixed,
};
*/

const createChannelRoute = /*::<ServerEvent, ClientEvent, Query: {}>*/(
  services/*: Services*/,
  channel/*: Channel<ServerEvent, ClientEvent, Query>*/,
  setupConnection/*: (connection: ChannelConnection<ServerEvent, Query>) => Promise<ChannelHandler<ClientEvent>>*/,
)/*: WSRoute */ => {
  const handler = async (wsConnection) => {
    const query = channel.toQuery(wsConnection.query);
    const user = await new Promise((res, rej) => wsConnection.socket.once('message', async message => {
      const authRequest = toAuthenticationRequest(JSON.parse(message));
      try {
        const user = await services.auth.getUserFromRequest(authRequest);
        wsConnection.socket.send(JSON.stringify({ type: 'grant-authentication', user }));
        res(user);
      } catch (error) {
        wsConnection.socket.send(JSON.stringify({ type: 'deny-authentication', user: authRequest }));
        rej(error);
      }
    }));

    const send = (event) => {
      wsConnection.socket.send(JSON.stringify(event, null, 2));
    };
    const disconnect = (code = 1000, reason = 'Server wanted to disconnected') => {
      wsConnection.socket.close(code, reason);
    };
    wsConnection.socket.on('close', () => {
      channelHandler.onDisconnect();
    });
    const channelConnection = {
      ...wsConnection,
      query,
      user,
      send,
      disconnect,
    };
    const channelHandler = await setupConnection(channelConnection);
    wsConnection.socket.on('message', message => {
      try {
        const value = JSON.parse(message);
        const event = channel.toClientEvent(value);
        channelHandler.onReceiveEvent(event);
      } catch (error) {
        console.error(error);
      }
    });
    channelHandler.onSetupComplete();
  };
  const route = {
    handler,
    path: channel.path,
  };

  return route;
};

module.exports = {
  createAPIEndpointHandler,
  createChannelRoute,
  withErrorHandling,
  streamToBuffer,
  ws,
  http,
};