// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameClient } from './game'; */
/*:: import type { StoreClient } from './store'; */
/*:: import type { RESTAuthorization } from './rest'; */
/*:: import type { AuthDetails } from './auth'; */
/*:: import type { UserClient } from './user'; */
/*:: import type { AudioClient } from './audio'; */

/*:: export type * from './user'; */

const { createAuthorization } = require('./auth');

const { createAudioClient } = require('./audio');
const { createGameClient } = require('./game');
const { createRESTClient } = require('./rest');
const { createStoreClient } = require('./store');
const { createUserClient } = require('./user');
const { createSocketClient } = require('./socket');

/*::
type WildspaceClient = {
  game: GameClient,
  store: StoreClient,
  user: UserClient,
  audio: AudioClient,
};

export type * from './store';
export type * from './game';
export type * from './player';
export type {
  WildspaceClient,
};
*/

const createWildspaceClient = (endpoint/*: URL*/, client/*: HTTPClient*/, authDetails/*: ?AuthDetails*/)/*: WildspaceClient*/ => {
  const restAuth = createAuthorization(authDetails);
  
  const restClient = createRESTClient({ endpoint, client, auth: restAuth });
  const socketClient = createSocketClient(endpoint, authDetails);
  const game = createGameClient(restClient);
  const store = createStoreClient(restClient);
  const user = createUserClient(restClient);
  const audio = createAudioClient(restClient, socketClient);

  return {
    game,
    store,
    user,
    audio,
  };
};

module.exports = {
  ...require('./auth'),
  createWildspaceClient,
};
