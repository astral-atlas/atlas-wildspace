// @flow strict
/*:: import type { Game, GameID, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */
/*:: import type { Handler } from './utils'; */

const { resource, json: { ok, created } } = require('@lukekaalim/server');
const { toGameParams } = require('@astral-atlas/wildspace-models');
const { withErrorHandling, validateContent } = require('./utils');

const { MissingParameterError } = require('../errors');

const createGameRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[] */ => {
  const read = async ({ query: { gameId }, auth }) => {
    if (!gameId)
      throw new MissingParameterError('gameId');
    const user = await services.auth.getUser(auth);
    const game = await services.games.read(gameId, user);
    return ok(game);
  };
  const listIds = async ({ auth }) => {
    const user = await services.auth.getUser(auth);
    return ok(await services.games.listIds(user));
  }

  const gameRoutes = resource('/game', {
    get: withErrorHandling(read),
  }, options);
  const gameIdRoutes = resource('/game/ids', {
    get: withErrorHandling(listIds),
  }, options);

  return [
    ...gameRoutes,
    ...gameIdRoutes,
  ];
};

module.exports = {
  createGameRoutes,
};