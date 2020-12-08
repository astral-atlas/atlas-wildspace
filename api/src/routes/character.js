// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */

const { resource, json: { ok, created } } = require('@lukekaalim/server');
const { MissingParameterError } = require('../errors');
const { withErrorHandling } = require('./utils');

/*
/games/characters?gameId=${gameId} =>
  GET: Get a list of all player characters in this game
*/
const createCharacterRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const readCharactersInGame = async ({ query: { gameId }, auth }) => {
    if (!gameId)
      throw new MissingParameterError('gameId');
    const user = await services.auth.getUser(auth);
    const game = await services.games.read(gameId, user);
    const characters = await services.character.getCharactersByGame(game.id);

    return ok(characters);
  }

  const charactersRoute = resource('/game/characters', {
    get: withErrorHandling(readCharactersInGame)
  }, options)

  return [
    ...charactersRoute,
  ];
};

module.exports = {
  createCharacterRoutes,
};