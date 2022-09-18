// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Character, CharacterID, GameID, Player } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
/*::
import type { GameCRUDClient } from "./meta";
import type { DeriveGameCRUDDescription } from "../../models/api/game/meta";
import type { GameAPI } from "../../models/api/game";
*/
import { gameAPI, playersAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta";

/*::
export type GameResourceClient = {
  models: GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/resources/models"]>>
};
*/

export const createGameResourcesClient = (http/*: HTTPServiceClient*/)/*: GameResourceClient*/ => {  
  const models =  createGameCRUDClient(http, gameAPI["/games/resources/models"], {
    name: 'model',
    idName: 'modelId'
  })
  return {
    models,
  };
};