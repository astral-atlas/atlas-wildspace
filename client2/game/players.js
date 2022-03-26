// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Character, CharacterID, GameID, Player } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
import { playersAPI } from "@astral-atlas/wildspace-models";

/*::
export type PlayersClient = {
  add: (gameId: GameID, playerId: UserID) => Promise<void>,
  remove: (gameId: GameID, playerId: UserID) => Promise<void>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<Player>>,
};
*/

export const createPlayersClient = (service/*: HTTPServiceClient*/)/*: PlayersClient*/ => {
  const r = service.createResource(playersAPI["/games/players"]);

  const add = async (gameId, playerId) => {
    await r.POST({ body: { gameId, playerId } });
  };
  const list = async (gameId) => {
    const { body: { players } } = await r.GET({ query: { gameId } });
    return players;
  };
  const remove = async (gameId, playerId) => {
    await r.DELETE({ query: { gameId, playerId } });
  };

  return { add, remove, list };
};