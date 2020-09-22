// @flow strict
/*:: import type { Game, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { Services } from '../services'; */
const { resource, ok } = require('@lukekaalim/server');
const {
  getResponseForError,
  MissingParameterError,
  NonexistentResourceError,
  InvalidPermissionError
} = require('../errors');

const games = new Map/*:: <GameID, Game>*/([
  ['123', {
    id: '123',
    players: [],
    gms: ['luke'],
    characters: [],
    monsters: [],
    grids: [],
  }],
  ['234', {
    id: '123',
    players: [],
    gms: ['luke'],
    characters: [],
    monsters: [],
    grids: [],
  }]
]);

const createGameRoutes = (services/*: Services*/) => {
  const getGame = (gameId, user) => {
    const game = games.get(gameId);

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
        const game = getGame(gameId, user);

        return ok(game);
      } catch (error) {
        return getResponseForError(error);
      }
    },
    async create({ auth, content }) {
      return ok();
    }
  })
};

module.exports = {
  createGameRoutes,
};