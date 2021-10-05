// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { UserID } from "@astral-atlas/sesame-models"; */
/*:: import type { GameID, Game } from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';
import { createJSONConnectionClient } from '@lukekaalim/ws-client';

import { gameAPI } from "@astral-atlas/wildspace-models";

/*::
export type GameClient = {
  read: (gameId: GameID) => Promise<Game>,
  list: () => Promise<$ReadOnlyArray<Game>>,
  create: (name: string, playerIds: UserID[]) => Promise<Game>,

  update: (gameId: GameID, updatedGame: { name?: string, playerIds?: UserID[] }) => Promise<void>,
  join: (gameId: GameID) => Promise<void>,
};
*/

export const createGameClient = (httpClient/*: HTTPClient*/, baseURL/*: string*/)/*: GameClient*/ => {
  const gameResource = createJSONResourceClient(gameAPI['/games'], httpClient, `http://${baseURL}`);
  const joinGameResource = createJSONResourceClient(gameAPI['/games/join'], httpClient, `http://${baseURL}`);
  const allGamesResource = createJSONResourceClient(gameAPI['/games/all'], httpClient, `http://${baseURL}`);

  const read = async (gameId) => {
    const { body: { game } } = await gameResource.GET({ query: { gameId }});
    return game;
  }
  const list = async () => {
    const { body: { games } } = await allGamesResource.GET();
    return games;
  }
  const create = async (name, playerIds) => {
    const { body: { game } } = await gameResource.POST({ body: { name, playerIds }});
    return game;
  }
  const update = async (gameId, { name = null, playerIds = null}) => {
    await gameResource.PUT({ query: { gameId },  body: { name, playerIds }});
  }
  const join = async (gameId) => {
    await joinGameResource.POST({ body: { gameId } });
  }
  return {
    read,
    list,
    create,
    update,
    join,
  };
}