// @flow strict
const s = require('@lukekaalim/schema');
const { characterId, monsterId } = require('./character');
const { gameMasterId, playerId } = require('./users');

const gridPosition = s.define('GridPosition', 'A unique 3D location on a grid', s.object([
  ['x', s.number()],
  ['y', s.number()],
  ['z', s.number()],
]));

const gridId = s.define('GridID', 'Unique ID for each Grid', s.string());
const grid = s.define('Grid', 'An integer/discrete space characters physically exist.', s.object([
  ['id', gridId],
  ['title', s.string()],
  ['characterLocations', s.array(s.tuple([gridPosition, characterId]))],
  ['monsterLocations', s.array(s.tuple([gridPosition, monsterId]))]
]));

const gameId = s.define('GameID', 'Unique ID for each Game', s.string());
const game = s.define('Game', 'A collection of players, locations and characters', s.object([
  ['id', gameId],
  ['gms', s.array(gameMasterId)],
  ['players', s.array(playerId)],
  ['grids', s.array(gridId)],
  ['characters', s.array(characterId)],
  ['monsters', s.array(monsterId)]
]));

module.exports = {
  game,
  gameId,
  grid,
  gridId,
};
