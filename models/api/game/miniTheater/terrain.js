// @flow strict

import { c } from "@lukekaalim/cast";
import { castTerrainProp, castModelResourcePath, castModelResourceId } from "../../../game.js";
import { createAdvancedCRUDGameAPI } from "../meta.js";

/*::
import type { TerrainProp, TerrainPropID, ModelResourceID, ModelResourcePath } from "../../../game";
import type { AdvancedGameCRUDAPI } from "../meta";
import type { ResourceDescription } from "@lukekaalim/net-description";


export type TerrainAPI = {|
  '/games/mini-theater/terrain-prop': AdvancedGameCRUDAPI<{
    resource: TerrainProp,
    resourceName: 'terrainProp',
    resourceId: TerrainPropID,
    resourceIdName: 'terrainPropId',
  
    resourcePostInput: {
      name: string,
      modelResourceId: ModelResourceID,
      modelPath: ModelResourcePath,
      iconPreviewCameraModelPath: ?ModelResourcePath,
    },
    resourcePutInput: {
      name: string,
    },
  }>,
|};
*/

export const terrainAPI = {
  '/games/mini-theater/terrain-prop': (createAdvancedCRUDGameAPI({
    path: '/games/mini-theater/terrain-prop',
    resourceName: 'terrainProp',
    resourceIdName: 'terrainPropId',
    castResource: castTerrainProp,
    castPostResource: c.obj({
      name: c.str,
      modelResourceId: castModelResourceId,
      modelPath: castModelResourcePath,
      iconPreviewCameraModelPath: c.maybe(castModelResourcePath),
    }),
    castPutResource: c.obj({
      name: c.str,
    }),
  })/*: ResourceDescription<TerrainAPI["/games/mini-theater/terrain-prop"]>*/)
};