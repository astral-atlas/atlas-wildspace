// @flow strict
/*::
import type {
  GameID,
  CRUDGameAPI,
  DeriveGameCRUDDescription,
  GameConnectionID,
  WikiDocConnection,
  WikiDocState,
} from "@astral-atlas/wildspace-models";
import type { WikiAPI } from "../../models/api/game/wiki";
import type { GameCRUDClient } from "./meta";
import type { UserID } from "@astral-atlas/sesame-models";
import type { WikiDocID, WikiDoc, WikiDocEvent, WikiDocAction, WikiDocFocus, WikiDocUpdate } from "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";
import type {  } from "../../models/game/wiki/state";
*/

import { createGameCRUDClient } from "./meta";
import { wikiAPI } from "@astral-atlas/wildspace-models";

/*::
export type WikiDocClient = {
  ...GameCRUDClient<DeriveGameCRUDDescription<WikiAPI["/game/wiki"]>>,
  getStateById: (GameID, WikiDocID) => Promise<WikiDocState>,
}
*/

export const createWikiDocClient= (http/*: HTTPServiceClient*/)/*: WikiDocClient*/  => {
  const client = createGameCRUDClient(http, wikiAPI["/game/wiki"], { idName: 'wikiDocId', name: 'wikiDoc' });
  const stateByIdResource = http.createResource(wikiAPI["/game/wiki/state/id"]);

  const getStateById = async (gameId, wikiDocId) => {
    const { body: { wikiDocState } } = await stateByIdResource.GET({ query: { gameId, wikiDocId } });
    return wikiDocState;
  };

  return {
    ...client,
    getStateById
  }
}
