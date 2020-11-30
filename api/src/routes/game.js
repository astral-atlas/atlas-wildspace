// @flow strict
/*:: import type { Game, GameID, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, ResourceOptions, Route } from '@lukekaalim/server'; */
/*:: import type { Handler } from './utils'; */

const { resource, ok, created } = require('@lukekaalim/server');
const { toGameParams } = require('@astral-atlas/wildspace-models');
const { withErrorHandling, validateContent } = require('./utils');

const { MissingParameterError } = require('../errors');

const createGameRoutes = (services/*: Services*/, options/*: ResourceOptions*/)/*: Route[] */ => {
  const read = async ({ params: { gameId }, auth }) => {
    if (!gameId)
      throw new MissingParameterError('gameId');
    const user = await services.auth.getUser(auth);
    const game = await services.games.read(gameId, user);
    return ok(game);
  };
  const create = async ({ auth, content }) => {
    const user = await services.auth.getUser(auth);
    const params = validateContent(content, toGameParams);
    const newGame = await services.games.create(params, user);
    
    return created(newGame);
  };
  const edit = async ({ params: { gameId }, auth, content }) => {
    if (!gameId)
      throw new MissingParameterError('gameId');
      
    const user = await services.auth.getUser(auth);
    const params = validateContent(content, toGameParams);
    const updatedGame = await services.games.update(gameId, params, user);

    return ok(updatedGame);
  };
  const destroy = async ({ params: { gameId }, auth }) => {
    if (!gameId)
      throw new MissingParameterError('gameId');

    const user = await services.auth.getUser(auth);
    const game = await services.games.destroy(gameId, user);

    return ok(game);
  };

  const gameRoutes = resource('/game', {
    read: withErrorHandling(read),
    create: withErrorHandling(create),
    edit: withErrorHandling(edit),
    destroy: withErrorHandling(destroy),
  }, options);

  return [
    ...gameRoutes,
  ];
};

module.exports = {
  createGameRoutes,
};