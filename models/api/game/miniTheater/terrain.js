// @flow strict

import { c } from "@lukekaalim/cast";
import { castTerrainProp, castModelResourcePath, castModelResourceId, castMiniTheaterShape } from "../../../game.js";
import { createAdvancedCRUDGameAPI } from "../meta.js";

/*::
import type { TerrainProp, TerrainPropID, ModelResourceID, ModelResourcePath, MiniTheaterShape } from "../../../game";
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
      floorShapes: $ReadOnlyArray<MiniTheaterShape>
    },
    resourcePutInput: {
      name: string,
      modelResourceId: ModelResourceID,
      modelPath: ModelResourcePath,
      iconPreviewCameraModelPath: ?ModelResourcePath,
      floorShapes: $ReadOnlyArray<MiniTheaterShape>
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
      floorShapes: c.arr(castMiniTheaterShape),
    }),
    castPutResource: c.obj({
      name: c.str,
      modelResourceId: castModelResourceId,
      modelPath: castModelResourcePath,
      iconPreviewCameraModelPath: c.maybe(castModelResourcePath),
      floorShapes: c.arr(castMiniTheaterShape),
    }),
  })/*: ResourceDescription<TerrainAPI["/games/mini-theater/terrain-prop"]>*/)
};