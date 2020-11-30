// @flow strict
/*:: import type { PlayerID, Player, PlayerParams, User } from '@astral-atlas/wildspace-models'; */ 
/*:: import type { StoreService, IndexService } from './store'; */ 
const { v4: uuid } = require('uuid');
const e = require('../errors');

/*::
type PlayerService = {
  read: (id: PlayerID) => Promise<Player>,
  create: (params: PlayerParams, user: User) => Promise<Player>,
  update: (id: PlayerID, params: PlayerParams, user: User) => Promise<Player>,
  destroy: (id: PlayerID, user: User) => Promise<Player>
};
export type {
  PlayerService,
};
*/

const createPlayerService = (store/*: StoreService<PlayerID, Player>*/)/*: PlayerService*/ => {
  const isUserPlayer = (player, user) => (
    user.type === 'player'
    && user.player.id === player.id
  );
  const read = async (id) => {
    const player = await store.get(id);
    if (!player)
      throw new e.NonexistentResourceError(`Player(${id})`, `Does not exist in the database`);
    return player;
  };
  const create = async (params, user) => {
    if (user.type !== 'game-master')
      throw new e.InvalidPermissionError(`New Player`, `Only GM's can create new players`);

    const newPlayer = {
      ...params,
      id: uuid(),
    };
    await store.set(newPlayer.id, newPlayer);

    return newPlayer;
  };
  const update = async (id, params, user) => {
    const player = await store.get(id);
    if (!player)
      throw new e.NonexistentResourceError(`Player(${id})`, `Does not exist in the database`);
    if (user.type !== 'game-master' && !isUserPlayer(player, user))
      throw new e.InvalidPermissionError(`New Player`, `Only GM's or the player themselves can update players`);

    const newPlayer = {
      ...params,
      id: uuid(),
    };
    await store.set(newPlayer.id, newPlayer);
    
    return newPlayer;
  };
  const destroy = async (id, user) => {
    const player = await store.get(id);
    if (!player)
      throw new e.NonexistentResourceError(`Player(${id})`, `Does not exist in the database`);
    if (user.type !== 'game-master' && !isUserPlayer(player, user))
      throw new e.InvalidPermissionError(`New Player`, `Only GM's or the player themselves can delete players`);

    await store.set(player.id, null);
    return player;
  };
  return {
    read,
    create,
    update,
    destroy,
  };
};

module.exports = {
  createPlayerService,
};