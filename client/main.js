// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameClient } from './game'; */
/*:: import type { StoreClient } from './store'; */
/*:: import type { RESTAuthorization } from './rest'; */
/*:: import type { AuthDetails } from './auth'; */
/*:: import type { UserClient } from './user'; */
/*:: import type { AudioClient } from './audio'; */
/*:: import type { AssetClient } from './asset'; */
/*:: import type { TableClient } from './table'; */

/*:: export type * from './user'; */

const { createAuthorization } = require('./auth');

const { createAudioClient } = require('./audio');
const { createGameClient } = require('./game');
const { createRESTClient } = require('./rest');
const { createStoreClient } = require('./store');
const { createUserClient } = require('./user');
const { createSocketClient } = require('./socket');
const { createAssetClient } = require('./asset');
const { createTableClient } = require('./table');

/*::
type WildspaceClient = {
  game: GameClient,
  store: StoreClient,
  user: UserClient,
  audio: AudioClient,
  asset: AssetClient,
  table: TableClient,
};

export type * from './store';
export type * from './game';
export type * from './player';
export type * from './socket';
export type * from './table';
export type {
  WildspaceClient,
};
*/

const createWildspaceClient = (httpEndpoint/*: URL*/, wsEndpoint/*: URL*/, client/*: HTTPClient*/, authDetails/*: ?AuthDetails*/)/*: WildspaceClient*/ => {
  const restAuth = createAuthorization(authDetails);
  
  const restClient = createRESTClient({ endpoint: httpEndpoint, client, auth: restAuth });
  const socketClient = createSocketClient(wsEndpoint, authDetails);
  const game = createGameClient(restClient);
  const store = createStoreClient(restClient);
  const user = createUserClient(restClient);
  const audio = createAudioClient(restClient, socketClient);
  const asset = createAssetClient(restClient, restAuth, httpEndpoint.href, client);
  const table = createTableClient(restClient);

  return {
    table,
    game,
    store,
    user,
    audio,
    asset,
  };
};

module.exports = {
  ...require('./auth'),
  ...require('./socket'),
  createWildspaceClient,
};
