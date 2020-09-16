// @flow strict
const s = require('@lukekaalim/schema');
const { playerId } = require('./users');

const characterId = s.define('CharacterID', 'Unique ID for each Character', s.string());
const character = s.define('Character', 'A named player character', s.object([
  ['id', characterId],
  ['name', s.string()],
  ['player', playerId]
]));

const monsterId = s.define('MonsterID', 'Unique ID for a NPC', s.string());
const monster = s.define('Monster', 'A GM controlled NPC', s.object([
  ['id', monsterId],
  ['name', s.string()]
]));

module.exports = {
  character, characterId,
  monster, monsterId,
};
