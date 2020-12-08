// @flow strict
/*:: import type { Player, PlayerID, GameMasterID, GameMaster, User, AuthenticationRequest } from '@astral-atlas/wildspace-models'; */
/*:: import type { Authorization } from '@lukekaalim/server'; */
/*:: import type { MemoryStore } from './store'; */
const e = require('../errors');

const gmSecrets = new Map/*:: <GameMasterID, string>*/([
  ['luke', 'bothways']
]);
const gms = new Map/*:: <GameMasterID, GameMaster>*/([
  ['luke', { id: 'luke', name: 'Luke Kaalim' }]
]);

/*::
export type AuthService = {
  getUser: Authorization => Promise<User>,
  getUserFromRequest: AuthenticationRequest => Promise<User>,
  getPlayer: (id: string, secret: string) => Promise<Player>,
  getGameMaster: (id: string, secret: string) => Promise<GameMaster>,
};
*/

const createAuthService = (
  players/*: MemoryStore<PlayerID, Player>*/,
  playerSecrets/*: MemoryStore<PlayerID, { secret: string }>*/
)/*: AuthService*/ => {
  const getPlayer = async (proposedId/*: string*/, proposedSecret/*: string*/) => {
    const player = await players.get(proposedId);
    if (!player)
      throw new e.InvalidAuthenticationError();
    const { secret } = await playerSecrets.get(proposedId) || {};
    if (secret !== proposedSecret)
      throw new e.InvalidAuthenticationError();
    return player;
  };
  const getGameMaster = async (proposedId/*: string*/, proposedSecret/*: string*/) => {
    const gm = gms.get(proposedId);
    if (!gm)
      throw new e.InvalidAuthenticationError();
    const secret = gmSecrets.get(proposedId);
    if (secret !== proposedSecret)
      throw new e.InvalidAuthenticationError();
    return gm;
  };

  const getUser = async (auth/*: Authorization*/)/*: Promise<User>*/ => {
    if (auth.type === 'none')
      throw new e.MissingAuthenticationError();
    if (auth.type !== 'bearer')
      throw new e.UnsupportedAuthorizationError();

    const [type, encodedId, encodedSecret] = auth.token.split(':', 3);
    const secret = Buffer.from(encodedSecret, 'base64').toString('utf-8');
    const id = Buffer.from(encodedId, 'base64').toString('utf-8');

    switch (type) {
      case 'player':
        return { type: 'player', player: await getPlayer(id, secret) };
      case 'game-master':
        return { type: 'game-master', gameMaster: await getGameMaster(id, secret) };
      default:
        throw new e.InvalidAuthenticationError(); 
    }
  };
  const getUserFromRequest = async ({ user, secret }) => {
    switch (user.type) {
      case 'player':
        return { type: 'player', player: await getPlayer(user.playerId, secret) };
      case 'game-master':
        return { type: 'game-master', gameMaster: await getGameMaster(user.gameMasterId, secret) };
      default:
        throw new e.InvalidAuthenticationError(); 
    }
  };

  return {
    getUser,
    getPlayer,
    getGameMaster,
    getUserFromRequest,
  };
};

module.exports = {
  createAuthService,
};
