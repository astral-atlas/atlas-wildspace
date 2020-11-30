// @flow strict
/*:: import type { GameID, Game, GameParams, User } from '@astral-atlas/wildspace-models'; */ 
/*:: import type { StoreService, IndexService } from './store'; */ 
/*:: import type { PlayerService } from './player'; */
const { v4: uuid } = require('uuid');
const e = require('../errors');

/*::
type GameService = {
  read: (id: GameID, user: User) => Promise<Game>,
  create: (params: GameParams, user: User) => Promise<Game>,
  update: (id: GameID, params: GameParams, user: User) => Promise<Game>,
  destroy: (id: GameID, user: User) => Promise<Game>,
  list: (user: User) => Promise<GameID[]>,
};

export type {
  GameService,
};
*/

const createGameService = (
  store/*: StoreService<GameID, Game>*/,
  index/*: IndexService<GameID>*/,
  player/*: PlayerService*/,
)/*: GameService*/ => {
  const isCreator = (game, user) => (
    user.type === 'game-master'
    && user.gameMaster.id === game.creator
  );
  const isPlayerInGame = (game, user) => (
    user.type === 'player'
    && game.players.includes(user.player.id)
  );
  const validateParams = async ({ players: ids }) => {
    // map every playerId to a real player
    await Promise.all(ids.map(id => player.read(id)));
  };

  const read = async (id, user) => {
    const game = await store.get(id);
    if (!game)
      throw new e.NonexistentResourceError(id, `GameID not found`);

    if (!isCreator(game, user) && !isPlayerInGame(game, user))
      throw new e.InvalidPermissionError(id, `User is not Creator or Player in Game`);
    
    return game;
  };
  const create = async (gameParams, user) => {
    if (user.type !== 'game-master')
      throw new e.InvalidPermissionError('New Game', `Only GM's can create Games`);

    await validateParams(gameParams);
    const newGame = {
      ...gameParams,
      id: uuid(),
      creator: user.gameMaster.id,
    };

    await store.set(newGame.id, newGame);

    return newGame;
  };
  const update = async (id, gameParams, user) => {
    const game = await store.get(id);
    if (!game)
      throw new e.NonexistentResourceError(id, `GameID not found`);
    if (!isCreator(game, user))
      throw new e.InvalidPermissionError(id, `Only the game creator can update games`);

    await validateParams(gameParams);
    await store.set(id, { ...game, ...gameParams });

    return game;
  };
  const destroy = async (id, user) => {
    const game = await store.get(id);
    if (!game)
      throw new e.NonexistentResourceError(id, `GameID not found`);
    if (!isCreator(game, user))
      throw new e.InvalidPermissionError(id, `Only the game creator can delete games`);

    await store.set(id, null);

    return game;
  };
  const list = async (user) => {
    if (user.type !== 'game-master')
      throw new e.InvalidPermissionError('AllGamesList', `Only a GM can list all games`);
    const gameIDs = await index.list();

    return gameIDs;
  }
  return {
    read,
    create,
    update,
    destroy,
    list,
  };
};

module.exports = {
  createGameService,
};