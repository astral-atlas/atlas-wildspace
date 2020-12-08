// @flow strict
/*:: import type { Server as HTTPServer } from 'http'; */
/*:: import Websocket from 'ws'; */
const { createServer: createHttpServer } = require('http');
const { createListener } = require('@lukekaalim/server');
const { createRoutes } = require('./routes');
const { createServices } = require('./services');
const { createWSListener, createWebSocketServer } = require('./socket');

const createWildspaceAPI = ()/*: [HTTPServer, Websocket.Server]*/ => {
  const services = createServices();
  const routes = createRoutes(services);

  const httpRoutes = routes
    .map(route => route.protocol === 'http' ? route.httpRoute : null)
    .filter(Boolean);
  const wsRoutes = routes
    .map(route => route.protocol === 'ws' ? route.wsRoute : null)
    .filter(Boolean);

  const httpListener = createListener(httpRoutes);
  const server = createHttpServer(httpListener);

  const wsListener = createWSListener(wsRoutes);
  const wsServer = createWebSocketServer(server, wsListener);

  return [server, wsServer];
};

module.exports = {
  createWildspaceAPI,
};
