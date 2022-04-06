// @flow strict
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { promises } from 'fs';

import { createWebSocketListener, createJSONConnectionRoute } from "@lukekaalim/ws-server";
import { createRouteListener, createJSONResourceRoutes, createFixedListener, listenServer } from "@lukekaalim/http-server";
import { HTTP_STATUS } from "@lukekaalim/net-description";


import { audioAPI, castAPIConfig } from '@astral-atlas/wildspace-models';
import { createMemoryData, createFileData } from "@astral-atlas/wildspace-data";

import { createRoutes } from './routes.js';
import { createServices } from "./services.js";
import { loadConfigFromFile } from "./config.js";

const createWildspaceServer = (config, services) => {
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
  
  const { ws, http } = createRoutes(services); 
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

const main = async (configPath) => {
  try {
    const config = await loadConfigFromFile(configPath);
    const services = createServices(config);
    
    const [httpServer, wsServer] = createWildspaceServer(config, services);
    const { httpOrigin, wsOrigin } = await listenServer(httpServer, config.port, 'localhost');
    console.log(`Listening on ${httpOrigin} & ${wsOrigin}`)
  } catch (error) {
    console.error(error);
  }
};

main(...process.argv.slice(2));