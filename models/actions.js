// @flow strict
const s = require('@lukekaalim/schema');
const { gridId, gridPosition } = require('./game');
const { characterId, monsterId } = require('./character');
const { pascal, kebab } = require('case');

const createAction = (actionName, params) => s.define(`${pascal(actionName)}Action`, '', s.object([
  ['type', s.literal(kebab(actionName))],
  ...params,
]))

const moveCharacterAction = createAction('MoveCharacter', [
  ['grid', gridId],
  ['character', characterId],
  ['position', gridPosition],
]);
const moveMonsterAction = createAction('MoveMonster', [
  ['grid', gridId],
  ['monster', monsterId],
  ['position', gridPosition],
]);

const playerAction = s.define('PlayerAction', 'A standard Action that can be submitted to a game by a player', s.union([
  moveCharacterAction,
]));

module.exports = {
  moveCharacterAction,
  moveMonsterAction,
  playerAction,
};
