// @flow strict
const { createServer } = require('http');
const { createListener } = require('@lukekaalim/server');
const { createRoutes } = require('./routes');
const { createServices } = require('./services');

const createWildspaceAPI = (port/*: number*/) => {
  const services = createServices();
  const routes = createRoutes(services)

  const listener = createListener(routes);
  const server = createServer(listener);
  server.listen(port);
  return server;
};

module.exports = {
  createWildspaceAPI,
};
