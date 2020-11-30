// @flow strict
/*:: import type { Game, GameID, PlayerID, Player } from '@astral-atlas/wildspace-models'; */
/*:: import type { AuthService } from './services/auth'; */
/*:: import type { StoreService, IndexService, MemoryStore } from './services/store'; */
/*:: import type { GameService } from './services/game'; */
/*:: import type { PlayerService } from './services/player'; */
const { createAuthService } = require('./services/auth');
const { createMemoryStore } = require('./services/store');
const { createGameService } = require('./services/game');
const { createPlayerService } = require('./services/player');

/*::
type Services = {
  auth: AuthService,
  games: GameService,
  players: PlayerService,
  stores: Stores,
};

type Stores = {
  game: MemoryStore<GameID, Game>,
  player: MemoryStore<PlayerID, Player>,
};

export type {
  AuthService,
  Services,
};
*/

const createStores = ()/*: Stores*/ => {
  const game = createMemoryStore/*:: <GameID, Game>*/([
    ['1234', { id: '1234', players: [], creator: 'luke' }]
  ]);
  const player = createMemoryStore/*:: <PlayerID, Player>*/();

  return {
    game,
    player,
  };
};

const createServices = ()/*: Services*/ => {
  const auth = createAuthService();
  const stores = createStores();

  const players = createPlayerService(stores.player);
  const games = createGameService(stores.game, stores.game, players);

  return {
    stores,
    auth,
    games,
    players,
  };
}

module.exports = {
  createServices,
};
