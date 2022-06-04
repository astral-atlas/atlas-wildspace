// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
/*::
import type { GameID, SceneID, Scene, GameAPI, DeriveGameCRUDDescription } from "@astral-atlas/wildspace-models";

import type { GameCRUDClient } from "./meta";
*/
import { scenesAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta";

/*::
export type SceneClient = {
  ...GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/scene"]>>
};
*/

export const createSceneClient = (http/*: HTTPServiceClient*/)/*: SceneClient*/ => {
  const sceneClient = createGameCRUDClient(http, scenesAPI["/games/scenes"], { idName: 'sceneId', name: 'scene' });


  return {
    ...sceneClient,
  }
};