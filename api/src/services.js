// @flow strict
/*:: import type { Game, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { AuthService } from './services/auth'; */
/*:: import type { StoreService } from './services/store'; */
const { createAuthService } = require('./services/auth');
const { createLocalStore } = require('./services/store');

/*::
type Services = {
  auth: AuthService,
  games: StoreService<GameID, Game>,
};
export type {
  AuthService,
  Services,
};
*/

const createServices = ()/*: Services*/ => {
  const auth = createAuthService();
  const games = createLocalStore/*:: <GameID, Game>*/();

  return {
    auth,
    games,
  };
}

module.exports = {
  createServices,
};
