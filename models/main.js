// @flow strict
/*:: export type * from './build/types.flow.js'; */
/*:: import type { SuperStructLib } from '@lukekaalim/schema'; */
const { toJSONSchemaDocument, createStruct } = require('@lukekaalim/schema');

const g = require('./game');
const c = require('./character');
const u = require('./users');
const a = require('./actions');
const h = require('./aspects');
const api = require('./api');
const audio = require('./audio');

const models = [
  g.game, g.gameId,
  g.grid, g.gridId,
  c.character, c.characterId,
  c.monster, c.monsterId,
  u.player, u.playerId,
  u.gameMaster, u.gameMasterId,
  u.user,
  a.playerAction,
  h.fateAspect,
  api.errorResponse,
  audio.audioSource,
  audio.httpSource,
  audio.youtubeSource,
];

const jsonSchemas = {
  game: toJSONSchemaDocument(g.game),
  grid: toJSONSchemaDocument(g.grid),
  character: toJSONSchemaDocument(c.character),
  monster: toJSONSchemaDocument(c.monster),
  player: toJSONSchemaDocument(u.player),
  gameMaster: toJSONSchemaDocument(u.gameMaster),
  user: toJSONSchemaDocument(u.user),
  playerAction: toJSONSchemaDocument(a.playerAction),
  fateAspect: toJSONSchemaDocument(h.fateAspect)
};

const createStructures = (superstruct/*: SuperStructLib*/) => {
  return {
    game: createStruct(superstruct, g.game),
    fateAspect: createStruct(superstruct, h.fateAspect),
    error: createStruct(superstruct, api.errorResponse),
  };
}

module.exports = {
  models,
  createStructures,
  jsonSchemas,
};
