// @flow strict
/*:: import type { GameID, Game, GameParams, User, Player } from '@astral-atlas/wildspace-models'; */ 
/*:: import type { Tables } from '../tables'; */ 
/*:: import type { PlayerService } from './player'; */
const { v4: uuid } = require('uuid');
const e = require('../errors');

/*::
type GameService = {
  read: (id: GameID, user: User) => Promise<Game>,
  //create: (params: GameParams, user: User) => Promise<Game>,
  //update: (id: GameID, params: GameParams, user: User) => Promise<Game>,
  //destroy: (id: GameID, user: User) => Promise<Game>,
  listIds: (user: User) => Promise<GameID[]>,
};

export type {
  GameService,
};
*/

const createGameService = (tables/*: Tables*/, player/*: PlayerService*/)/*: GameService*/ => {
  const isCreator = (game, user) => (
    user.type === 'game-master'
    && user.gameMaster.id === game.creator
  );

  const read = async (gameId, user) => {
    const [game] = await tables.game.games.select({ gameId });
    if (!game)
      throw new e.NonexistentResourceError(gameId, `GameID not found`);
    const playersInGame = await tables.game.playersInGames.select({ gameId });
    const players = playersInGame.map(p => p.playerId);
    if (user.type === 'game-master')
      return {
        ...game,
        id: game.gameId,
        players,
      };

    const isInGame = players.includes(user.player.id);

    if (!isInGame)
      throw new e.InvalidPermissionError(gameId, `User is not Player in Game`);
    
    return {
      ...game,
      players,
    };
  };
  const listIds = async (user, offset, limit) => {
    const options = { offset, limit };
    switch (user.type) {
      case 'game-master':
        return (await tables.game.games.select({}, options))
          .map(game => game.gameId);
      case 'player':
        return (await tables.game.playersInGames.select({ playerId: user.player.id }, options))
          .map(playerInGame => playerInGame.gameId);
    }
  }

  return {
    read,
    //create,
    //update,
    //destroy,
    listIds,
  };
};

module.exports = {
  createGameService,
};