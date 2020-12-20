// @flow strict
/*:: import type { Game, GameID, PlayerID, Character } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
const { toGame, toGameArray, toCharacter, toGameID } = require('@astral-atlas/wildspace-models');

/*::
type GameClient = {
  getGame: (game: GameID) => Promise<Game>,
  getGameIds: () => Promise<GameID[]>,
  getCharactersInGame: (game: GameID) => Promise<Character[]>,
};
export type {
  GameClient,
};
*/

const toArray = (value/*: mixed*/)/*: $ReadOnlyArray<mixed>*/ => {
  if (!Array.isArray(value))
    throw new TypeError();
  return value;
};

const createGameClient = (rest/*: RESTClient*/)/*: GameClient*/ => {
  const getGame = async (gameId) => {
    const { content } = await rest.get({ resource: '/game', params: { gameId } });
    const game = toGame(content);
    return game;
  };
  const getCharactersInGame = async (gameId) => {
    const { content } = await rest.get({ resource: '/game/characters', params: { gameId } });
    const characters = toArray(content).map(toCharacter);
    return characters;
  };
  const getGameIds = async () => {
    const { content } = await rest.get({ resource: '/game/ids' });
    const ids = toArray(content).map(toGameID);
    return ids;
  }

  return {
    getGameIds,
    getGame,
    getCharactersInGame,
  };
};

module.exports = {
  createGameClient,
};
