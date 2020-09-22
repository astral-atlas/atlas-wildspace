// @flow strict
/*:: import type { Game, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { Services } from '../services'; */
const { v4: uuid } = require('uuid');
const { resource, ok, created } = require('@lukekaalim/server');
const {
  getResponseForError,
  MissingParameterError,
  NonexistentResourceError,
  InvalidPermissionError
} = require('../errors');

const createGameRoutes = (services/*: Services*/) => {
  const getGame = async (gameId, user) => {
    const game = await services.games.get(gameId);

    if (!game)
      throw new NonexistentResourceError('game', `no game with gameId: ${gameId}`);

    if (user.type === 'player' && !game.players.includes(user.player.id))
      throw new InvalidPermissionError('game', 'user is not a player in game');
    if (user.type === 'game-master' && !game.gms.includes(user.gameMaster.id))
      throw new InvalidPermissionError('game', 'user is not a game master in game');

    return game;
  }

  return resource('/game', {
    async read({ params: { gameId }, auth }) {
      try {
        if (!gameId)
          throw new MissingParameterError('gameId');
  
        const user = services.auth.getUser(auth);
        const game = await getGame(gameId, user);

        return ok(game);
      } catch (error) {
        return getResponseForError(error);
      }
    },
    async create({ auth, content }) {
      const user = services.auth.getUser(auth);
      if (user.type !== 'game-master')
        throw new InvalidPermissionError('game', 'user is not a gm, only gms can create games');

      const newGame/*: Game*/ = {
        id: uuid(),
        gms: [user.gameMaster.id],
        players: [],
        grids: [],
        characters: [],
        monsters: [],
      };

      await services.games.set(newGame.id, newGame);

      return created(newGame);
    }
  })
};

module.exports = {
  createGameRoutes,
};