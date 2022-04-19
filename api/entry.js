// @flow strict
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { createWebSocketListener } from "@lukekaalim/ws-server";
import { createRouteListener, createFixedListener, listenServer } from "@lukekaalim/http-server";

import { createRoutes } from './routes.js';
import { createServices } from "./services.js";
import { loadConfigFromFile } from "./config.js";

const middleware = (r) => {
  const handler = async (request) => {
    try {
      const response = await r.handler(request);
      console.log(request.method, request.path, response.status);
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

const createWildspaceServer = async (configPath) => {
  const config = await loadConfigFromFile(configPath);
  const services = createServices(config);
  const { ws, http } = createRoutes(services);
  const wsListener = createWebSocketListener(ws)
  const httpListener = createRouteListener(
    http.map(middleware),
    createFixedListener({ status: 404, body: `Page not found`, headers: {} })
  )

  const httpServer = createServer();
  const wsServer = new WebSocketServer({ server: httpServer });

  httpServer.addListener('request',httpListener);
  wsServer.addListener('connection', wsListener);
    
  const { httpOrigin, wsOrigin } = await listenServer(httpServer, config.port, 'localhost');
  console.log(`Listening on ${httpOrigin} & ${wsOrigin}`)
};

const main = async (configPath) => {
  try {
    await createWildspaceServer(configPath);
  } catch (error) {
    console.error(error);
  }
};

main(...process.argv.slice(2));