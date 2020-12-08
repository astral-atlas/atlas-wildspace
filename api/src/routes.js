// @flow strict
/*:: import type { Route as HTTPRoute, RestOptions } from '@lukekaalim/server'; */
/*:: import type { WSRoute } from './socket'; */
/*:: import type { Services } from './services'; */
const { createGameRoutes } = require('./routes/game');
const { createStoreRoutes } = require('./routes/store');
const { createCharacterRoutes } = require('./routes/character');
const { createUserRoutes } = require('./routes/user');
const { createAudioRoutes } = require('./routes/audio');

/*::
export type APIRoute =
  | { protocol: 'http', httpRoute: HTTPRoute }
  | { protocol: 'ws', wsRoute: WSRoute }
*/

const options = {
  allowedOrigins: { type: 'whitelist', origins: ['http://localhost:60018'] },
  authorized: true,
  allowedHeaders: ['authorization'],
  cacheSeconds: 120
};

const createRoutes = (services/*: Services*/)/*: APIRoute[]*/ => {
  const gameRoutes = createGameRoutes(services, options);
  const storeRoutes = createStoreRoutes(services, options);
  const characterRoutes = createCharacterRoutes(services, options);
  const userRoutes = createUserRoutes(services, options);
  const audioRoutes = createAudioRoutes(services, options);

  return [
    ...audioRoutes,
    ...[
      ...userRoutes,
      ...characterRoutes,
      ...gameRoutes,
      ...storeRoutes,
    ].map(httpRoute => ({ protocol: 'http', httpRoute }))
  ];
};

module.exports = {
  createRoutes,
};
