// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameClient } from './game'; */
/*:: import type { StoreClient } from './store'; */
const { createGameClient } = require('./game');
const { createAuthorization } = require('./auth');
const { createRESTClient } = require('./rest');
const { createStoreClient } = require('./store');

/*::
type WildspaceClient = {
  game: GameClient,
  store: StoreClient,
};

export type * from './store';
export type * from './game';
export type * from './player';
export type {
  WildspaceClient,
};
*/

const createWildspaceClient = (endpoint/*: URL*/, client/*: HTTPClient*/, user/*: User*/, secret/*: string*/)/*: WildspaceClient*/ => {
  const auth = createAuthorization(user, secret);
  const restClient = createRESTClient({ endpoint, client, auth });
  const game = createGameClient(restClient);
  const store = createStoreClient(restClient);

  return {
    game,
    store,
  };
};

module.exports = {
  createWildspaceClient,
};
