// @flow strict
/*::
import type {
  GameID,
  MiniTheaterAPI,
  DeriveGameCRUDDescription,
  MiniTheaterID, MiniTheaterAction,
  MiniTheater,
} from "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";

import type { GameCRUDClient } from "./meta";
*/
import { gameAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta.js";

/*::
export type MiniTheaterClient = {|
  ...GameCRUDClient<DeriveGameCRUDDescription<MiniTheaterAPI["/mini-theater"]>>,
  readById: (gameId: GameID, miniTheaterId: MiniTheaterID) => Promise<MiniTheater>,
  act: (gameId: GameID, miniTheaterId: MiniTheaterID, action: MiniTheaterAction) => Promise<void>,
|};
*/

export const createMiniTheaterClient = (http/*: HTTPServiceClient*/)/*: MiniTheaterClient*/ => {
  const byIdResource = http.createResource(gameAPI["/mini-theater/id"])
  const actionResource = http.createResource(gameAPI["/mini-theater/action"])
  const miniTheaterClient = createGameCRUDClient(
    http,
    gameAPI["/mini-theater"],
    { idName: 'miniTheaterId', name: 'miniTheater' }
  );
  const readById = async (gameId, miniTheaterId) => {
    const { body: { miniTheater } } = await byIdResource.GET({ query: { gameId, miniTheaterId }});
    return miniTheater;
  }
  const act = async (gameId, miniTheaterId, action) => {
    await actionResource.POST({ query: { gameId, miniTheaterId }, body: { action }})
  }

  return {
    ...miniTheaterClient,
    readById,
    act,
  }
};

