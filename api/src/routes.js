// @flow strict
/*:: import type { Route, ResourceOptions } from '@lukekaalim/server'; */
/*:: import type { Services } from './services'; */
const { createGameRoutes } = require('./routes/game');
const { createStoreRoutes } = require('./routes/store');

const options = {
  allowedOrigins: { type: 'whitelist', origins: ['http://localhost:60018'] },
  authorized: true,
  allowedHeaders: ['authorization'],
  cacheSeconds: 120
};

const createRoutes = (services/*: Services*/)/*: Route[]*/ => {
  const gameRoutes = createGameRoutes(services, options);
  const storeRoutes = createStoreRoutes(services, options);

  return [
    ...gameRoutes,
    ...storeRoutes,
  ];
};

module.exports = {
  createRoutes,
};
