// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Authorization } from './rest'; */
const { fromBase64, toBase64 } = require('./base64');

const createGMToken = (gm, secret) => {
  return ['game-master', toBase64(gm.id), toBase64(secret)].join(':');
}

const createPlayerToken = (player, secret) => {
  return ['player', toBase64(player.id), toBase64(secret)].join(':');
}

const createAuthorization = (user/*: User*/, secret/*: string*/)/*: Authorization*/ => {
  switch (user.type) {
    case 'player':
      return { type: 'bearer', token: createPlayerToken(user.player, secret) };
    case 'game-master':
      return { type: 'bearer', token: createGMToken(user.gameMaster, secret) };
    default:
      throw new Error(`Unknown User type`);
  }
};

module.exports = {
  createAuthorization,
};
