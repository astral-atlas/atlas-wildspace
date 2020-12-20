// @flow strict
/*:: import type { UserReference, PlayerID, GameMasterID } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTAuthorization } from './rest'; */
const { fromBase64, toBase64 } = require('./base64');
const { createGameClient } = require('./game');

/*::
export type AuthDetails = {
  user: UserReference,
  secret: string,
}
*/

const createPlayerAuthorization = (id/*: PlayerID*/, secret/*: string*/)/*: RESTAuthorization*/ => {
  const token = ['player', toBase64(id), toBase64(secret)].join(':')
  const auth = { type: 'bearer', token };
  return auth;
}
const createGMAuthorization = (id/*: GameMasterID*/, secret/*: string*/)/*: RESTAuthorization*/ => {
  const token = ['game-master', toBase64(id), toBase64(secret)].join(':');
  const auth = { type: 'bearer', token };
  return auth;
}

const createGuestAuthorization = ()/*: RESTAuthorization*/ => {
  return { type: 'none' };
}

const createAuthorization = (details/*: ?AuthDetails*/)/*: RESTAuthorization*/ => {
  if (!details)
    return createGuestAuthorization();
  switch (details.user.type) {
    case 'player':
      return createPlayerAuthorization(details.user.playerId, details.secret);
    case 'game-master':
      return createGMAuthorization(details.user.gameMasterId, details.secret);
  }
}

module.exports = {
  createPlayerAuthorization,
  createGMAuthorization,
  createGuestAuthorization,
  createAuthorization,
};
