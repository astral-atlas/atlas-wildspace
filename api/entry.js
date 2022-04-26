// @flow strict
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { createWebSocketListener } from "@lukekaalim/ws-server";
import { createRouteListener, createFixedListener, listenServer } from "@lukekaalim/http-server";

import { createRoutes } from './routes.js';
import { createServices } from "./services.js";
import { loadConfigFromFile } from "./config.js";
import * as fs from "fs";

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

  let shuttingDown = false;
  const onShutdown = async () => {
    if (shuttingDown)
      return;
    console.log('Starting Graceful Shutdown')
    shuttingDown = true;
    setTimeout(() => {
      // Times up!
      console.log('Graceful shutdown timeout, killing process');
      process.exit(1);
    }, 2000);
    await Promise.all([...wsServer.clients].map(async client => {
      client.close(1000, 'Server is Shutting Down');
    }))
    wsServer.close((error) => {
      if (error)
        console.error(error);
      else
        console.log(`WS Shut down`);
      httpServer.close((error) => {
        if (error)
          console.error(error);
        else
          console.log(`HTTP Shutdown`);

        process.kill(process.pid, 'SIGTERM');
      })
    });
  }

  process.on('SIGUSR2', () => onShutdown());
  process.on('SIGINT', () => onShutdown());
};

const main = async (configPath) => {
  try {
    await createWildspaceServer(configPath);
  } catch (error) {
    console.error(error);
  }
};

main(...process.argv.slice(2));