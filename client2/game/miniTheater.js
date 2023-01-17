// @flow strict
/*::
import type {
  GameID,
  MiniTheaterAPI,
  DeriveGameCRUDDescription,
  MiniTheaterID, MiniTheaterAction,
  MiniTheater,
  GameAPI,
} from "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";

import type { GameCRUDClient, GameResourceClient } from "./meta";
*/
import { gameAPI, miniTheaterAPISpec } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta.js";
import { createGameResourceClient } from "./meta";

/*::
export type MiniTheaterClient = {|
  ...GameCRUDClient<DeriveGameCRUDDescription<MiniTheaterAPI["/mini-theater"]>>,
  readById: (gameId: GameID, miniTheaterId: MiniTheaterID) => Promise<MiniTheater>,
  act: (gameId: GameID, miniTheaterId: MiniTheaterID, action: MiniTheaterAction) => Promise<void>,
  terrainProps: GameResourceClient<GameAPI["/games/mini-theater/terrain-prop/v2"]>
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

  const terrainProps = createGameResourceClient(miniTheaterAPISpec["/games/mini-theater/terrain-prop/v2"], http);

  return {
    ...miniTheaterClient,
    terrainProps,
    readById,
    act,
  }
};

