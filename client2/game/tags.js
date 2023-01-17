// @flow strict

/*::
import type { GameAPI } from "../../models/api/game";
import type { GameResourceClient } from "./meta";
import type { HTTPServiceClient } from "../wildspace";
*/

import { gameResourceSpec } from "@astral-atlas/wildspace-models";
import { createGameResourceClient } from "./meta";

/*::
export type TagClient = GameResourceClient<GameAPI["/games/tags"]>;
*/

export const createTagClient = (http/*: HTTPServiceClient*/)/*: TagClient*/ => {
  return createGameResourceClient(gameResourceSpec["/games/tags"], http);
}