// @flow strict
/*::
import type {
  GameID,
  MiniTheaterAPI,
  DeriveGameCRUDDescription,
  MiniTheaterID,
} from "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";

import type { GameCRUDClient } from "./meta";
import type { GameUpdatesConnection } from "./updates";
*/
import { gameAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta.js";

/*::
export type MiniTheaterClient = {|
  ...GameCRUDClient<DeriveGameCRUDDescription<MiniTheaterAPI["/mini-theater"]>>,
|};
*/

export const createMiniTheaterClient = (http/*: HTTPServiceClient*/)/*: MiniTheaterClient*/ => {
  const miniTheaterClient = createGameCRUDClient(
    http,
    gameAPI["/mini-theater"],
    { idName: 'miniTheaterId', name: 'miniTheater' }
  );

  return {
    ...miniTheaterClient,
  }
};

