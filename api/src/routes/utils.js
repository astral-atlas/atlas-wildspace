// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { ResourceRequest, RouteResponse, Route as HTTPRoute } from '@lukekaalim/server';*/
/*:: import type { APIRoute } from '../routes';*/
/*:: import type { WSRoute } from '../socket';*/
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

module.exports = {
  withErrorHandling,
  streamToBuffer,
  ws,
  http,
};