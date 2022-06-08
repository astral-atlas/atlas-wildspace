// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
/*::
import type { GameID, GameAPI, DeriveGameCRUDDescription } from "@astral-atlas/wildspace-models";

import type { GameCRUDClient } from "./meta";
*/
import { gameAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta";

/*::
export type ExpositionClient = {
  ...GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/exposition"]>>
};
*/

export const createExpositionClient = (http/*: HTTPServiceClient*/)/*: ExpositionClient*/ => {
  const expositionClient = createGameCRUDClient(http, gameAPI["/games/exposition"], { idName: 'expositionId', name: 'exposition' });


  return {
    ...expositionClient,
  }
};