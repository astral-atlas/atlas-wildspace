// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
const { createGameClient } = require('./game');
const { createAuthorization } = require('./auth');
const { createRESTClient } = require('./rest');

const createWildspaceClient = (endpoint/*: URL*/, client/*: HTTPClient*/, user/*: User*/, secret/*: string*/) => {
  const auth = createAuthorization(user, secret);
  const restClient = createRESTClient({ endpoint, client, auth });
  const game = createGameClient(restClient);

  return {
    game,
  };
};

module.exports = {
  createWildspaceClient,
};
