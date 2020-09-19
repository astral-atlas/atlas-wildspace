// @flow strict
/*:: import type { Services } from './services'; */
const { createGameRoutes } = require('./routes/game');

const createRoutes = (services/*: Services*/) => {
  const gameRoutes = createGameRoutes(services);

  return [
    ...gameRoutes
  ];
};

module.exports = {
  createRoutes,
};
