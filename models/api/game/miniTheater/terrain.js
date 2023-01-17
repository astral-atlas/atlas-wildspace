// @flow strict

/*::
import type { TerrainProp, TerrainPropID, ModelResourceID, ModelResourcePath, MiniTheaterShape } from "../../../game";
import type { AdvancedGameCRUDAPI } from "../meta";
import type { ResourceDescription } from "@lukekaalim/net-description";
import type {
  GameResource,
} from "../meta/gameResource";
import type { TerrainPropNode, TerrainPropNodeID } from "../../../game";
*/

import { c } from "@lukekaalim/cast";
import { castTerrainProp, castModelResourcePath, castModelResourceId, castMiniTheaterShape } from "../../../game.js";
import { createAdvancedCRUDGameAPI } from "../meta.js";
import {
  castTerrainPropNode,
  castTerrainPropNodeId,
  castTerrainPropNodePath,
} from "../../../game/miniTheater/terrain.js";
import { createStandardGameAPIDescription } from "../meta/gameResource.js";

/*::
export type TerrainV2Resource = {
  resource: TerrainProp,
  input: {|
    iconCameraId: ?TerrainPropNodeID,
    nodes: $ReadOnlyArray<TerrainPropNode>,
    rootNodes: $ReadOnlyArray<TerrainPropNodeID>,
  |}
}

export type TerrainAPI = {|
  '/games/mini-theater/terrain-prop/v2': TerrainV2Resource,
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
      floorShapes: $ReadOnlyArray<MiniTheaterShape>,
    },
  }>,
|};
*/

export const terrainV2Spec/*: GameResource<TerrainV2Resource>["asGameResourceSpec"]*/ = {
  path: '/games/mini-theater/terrain-prop/v2',
  castResource: castTerrainProp,
  castInput: c.obj({
    iconCameraId: castTerrainPropNodeId,
    nodes: c.arr(castTerrainPropNode),
    rootNodes: c.arr(castTerrainPropNodeId),
  }),
}
export const terrainAPIV2Description/*: GameResource<TerrainV2Resource>["asAPIResource"]*/ =
  createStandardGameAPIDescription(terrainV2Spec);

export const terrainAPISpec = {
  '/games/mini-theater/terrain-prop/v2': terrainV2Spec,
}

export const terrainAPI = {
  '/games/mini-theater/terrain-prop/v2': terrainAPIV2Description,

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