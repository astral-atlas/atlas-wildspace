// @flow strict
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { createWebSocketListener, createJSONConnectionRoute } from "@lukekaalim/ws-server";
import { createRouteListener, createJSONResourceRoutes, createFixedListener, listenServer } from "@lukekaalim/http-server";
import { HTTP_STATUS } from "@lukekaalim/net-description";


import { audioAPI } from '@astral-atlas/wildspace-models';
import { createMemoryData, createFileData } from "@astral-atlas/wildspace-data";

import { createRoutes } from './routes.js';

const createWildspaceServer = () => {
  const middleware = (r) => {
    const handler = async (request) => {
      try {
        const response = await r.handler(request);
        console.log(request.method, request.path, Object.fromEntries(request.query.entries()), response.status);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    return {
      ...r,
      handler,
    }
  }
  
  console.log(process.cwd())
  const { ws, http } = createRoutes(createFileData('./data')); 
  const httpRoutes = [
    ...http,
  ].map(middleware);
  const wsRoutes = [
    ...ws,
  ];

  const httpServer = createServer();
  const wsServer = new WebSocketServer({ server: httpServer });

  httpServer.addListener('request', createRouteListener(httpRoutes, createFixedListener({ status: 404, body: `Page not found`, headers: {} })));
  wsServer.addListener('connection', createWebSocketListener(wsRoutes));

  return [httpServer, wsServer]
};

const main = async () => {
  const [httpServer, wsServer] = createWildspaceServer();
  const { httpOrigin, wsOrigin } = await listenServer(httpServer, 5567, 'localhost');
  console.log(`Listening on ${httpOrigin} & ${wsOrigin}`)
};

main();