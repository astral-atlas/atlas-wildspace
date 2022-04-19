// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */

/*::
import type { Cast } from '@lukekaalim/cast';

import type { CRUDGameAPI } from './meta.js';

import type {
  EncounterScene, EncounterSceneID,
  ExpositionSceneID, ExpositionScene
} from "../../game/index.js";
*/

import { createCRUDGameAPI } from './meta.js';
import {
  castExpositionScene, castExpositionSceneID
} from "../../game/scene.js";

/*::
export type ScenesAPI = {|
  '/games/scenes/exposition': CRUDGameAPI<ExpositionScene, 'exposition', ExpositionSceneID>,
  '/games/scenes/encounter': CRUDGameAPI<EncounterScene, 'exposition', EncounterSceneID>,
|};
*/

export const gameExpositionScene/*: ResourceDescription<ScenesAPI['/games/scenes/exposition']>*/ = createCRUDGameAPI(
  '/games/scenes/exposition',
  'exposition',
  castExpositionScene,
  castExpositionSceneID,
)

export const scenesAPI = {
  '/games/scenes/exposition': gameExpositionScene,
};
