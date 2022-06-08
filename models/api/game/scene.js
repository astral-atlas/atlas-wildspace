// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */

/*::
import type { Cast } from '@lukekaalim/cast';

import type { CRUDGameAPI } from './meta.js';

import type { AdvancedGameCRUDAPI } from "./meta";
import type { Scene, SceneID } from "../../game/scene";
*/

import { castScene } from "../../game/scene.js";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { c } from '@lukekaalim/cast';

/*::
export type ScenesAPI = {|
  '/games/scene': AdvancedGameCRUDAPI<{
    resourceIdName: 'sceneId',
    resourceName: 'scene',
    resource: Scene,
    resourceId: SceneID,
    resourcePostInput: { title: string },
    resourcePutInput: Scene,
  }>,
|};
*/

const scene/*: ResourceDescription<ScenesAPI["/games/scene"]>*/ = createAdvancedCRUDGameAPI({
  path: '/games/scenes',
  resourceIdName: 'sceneId',
  resourceName: 'scene',
  castResource: castScene,
  castPostResource: c.obj({ title: c.str }),
  castPutResource: castScene,
})

export const scenesAPI = {
  '/games/scenes': scene,
};
