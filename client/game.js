// @flow strict
/*:: import type { Game, GameID, PlayerID } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
const { toGame, toGameArray } = require('@astral-atlas/wildspace-models');

/*::
type GameClient = {
  getGame: (game: GameID) => Promise<Game>,
  createGame: (players: PlayerID[]) => Promise<Game>,
};
export type {
  GameClient,
};
*/

const createGameClient = (rest/*: RESTClient*/)/*: GameClient*/ => {
  const getGame = async (gameId) => {
    const { content } = await rest.read({ resource: '/game', params: { gameId } });
    const game = toGame(content);
    return game;
  };
  const createGame = async (players) => {
    const { content } = await rest.create({ resource: '/game', content: { players } });
    const game = toGame(content);
    return game;
  }

  return {
    getGame,
    createGame,
  };
};

module.exports = {
  createGameClient,
};
