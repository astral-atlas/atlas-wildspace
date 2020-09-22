// @flow strict
const s = require('@lukekaalim/schema');

const gameMasterId = s.define('GameMasterID', 'A unique ID for a GameMaster', s.string());
const gameMaster = s.define('GameMaster', 'An authoritative user with special permissions', s.object([
  ['id', gameMasterId],
  ['name', s.string()],
]));

const playerId = s.define('PlayerID', 'A unique ID for a Player', s.string());
const player = s.define('Player', 'A player is a regular user', s.object([
  ['id', playerId],
  ['name', s.string()],
]));

const user = s.define('User', 'A type of player in wildspace', s.union([
  s.object([
    ['type', s.literal('player')],
    ['player', player],
  ]),
  s.object([
    ['type', s.literal('game-master')],
    ['gameMaster', gameMaster],
  ]),
]));

module.exports = {
  player, playerId,
  gameMaster, gameMasterId,
  user,
};
