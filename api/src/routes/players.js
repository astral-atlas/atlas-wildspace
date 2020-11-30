// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, Route } from '@lukekaalim/server'; */
const { v4: uuid } = require('uuid');

const { resource, ok, created } = require('@lukekaalim/server');
const { toPlayerParams } = require('@astral-atlas/wildspace-models');
const { withErrorHandling, validateContent } = require('./utils');
const e = require('../errors');

const playerRoutes = (services/*: Services*/)/*: Route[]*/  => {
  const create = async ({ auth, content }) => {
    const user = await services.auth.getUser(auth);
    const params = validateContent(content, toPlayerParams);
    const player = await services.players.create(params, user);
    return created(player);
  };
  const read = async ({ params: { playerId }}) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');

    const player = await services.players.read(playerId);
    return ok(player);
  };
  const update = async ({ params: { playerId }, content, auth }) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');

    const user = await services.auth.getUser(auth);
    const params = validateContent(content, toPlayerParams);

    const newPlayer = await services.players.update(playerId, params, user);
    return ok(newPlayer);
  };
  const destroy = async ({ params: { playerId }, auth}) => {
    if (!playerId)
      throw new e.MissingParameterError('playerId');
    const user = await services.auth.getUser(auth);
    const destroyedPlayer = await services.players.destroy(playerId, user);
    return ok(destroyedPlayer);
  };
  return resource('/players', {
    create: withErrorHandling(create),
    read: withErrorHandling(read),
    update: withErrorHandling(update),
    destroy: withErrorHandling(destroy),
  });
};

module.exports = {
  playerRoutes,
};
