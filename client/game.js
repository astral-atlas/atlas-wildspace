// @flow strict
/*:: import type { Game, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
const { coerce } = require('superstruct');
const { game: gameStruct } = require('./structs');

const createGameClient = (rest/*: RESTClient*/) => {
  const getGame = async (gameId/*: GameID*/)/*: Promise<Game>*/ => {
    const { content } = await rest.read({ resource: '/game', params: { gameId } });
    return coerce(content, gameStruct);
  };
  const createGame = async ()/*: Promise<Game>*/ => {
    const { content } = await rest.create({ resource: '/game' });
    return coerce(content, gameStruct);
  }

  return {
    getGame,
    createGame,
  };
};

module.exports = {
  createGameClient,
};
