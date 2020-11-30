// @flow strict
/*:: import type { Server } from 'http'; */
const { createServer } = require('http');
const { createListener } = require('@lukekaalim/server');
const { createRoutes } = require('./routes');
const { createServices } = require('./services');

const createWildspaceAPI = ()/*: Server*/ => {
  const services = createServices();
  const routes = createRoutes(services)

  const listener = createListener(routes);
  const server = createServer(listener);
  return server;
};

module.exports = {
  createWildspaceAPI,
};
