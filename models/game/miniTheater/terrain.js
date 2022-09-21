// @flow strict
/*::
import type { BoardArea } from "../../encounter/board";
import type { BoardPosition } from "../../encounter/map";
import type { EditingLayerID } from "./editingLayer.js";
import type {
  ModelResourceID,
  ModelResourcePath,
  TextureResourceID,
} from "../resources";
import type { MiniQuaternion, MiniVector } from "./primitives";
import type { Cast } from "@lukekaalim/cast";
*/

import { castModelResourceId, castModelResourcePath } from "../resources.js";
import { castEditingLayerID } from "./editingLayer.js";
import { castMiniQuaternion, castMiniVector } from "./primitives.js";
import { c } from "@lukekaalim/cast";

/*::
export type TerrainPropID = string;
export type TerrainProp = {
  id: TerrainPropID,

  name: string,

  modelResourceId: ModelResourceID,
  modelPath: ModelResourcePath,
  iconPreviewCameraModelPath: ?ModelResourcePath,
};
*/
export const castTerrainPropId/*: Cast<TerrainPropID>*/ = c.str;
export const castTerrainProp/*: Cast<TerrainProp>*/ = c.obj({
  id: castTerrainPropId,
  name: c.str,
  modelResourceId: castModelResourceId,
  modelPath: castModelResourcePath,
  iconPreviewCameraModelPath: c.maybe(castModelResourcePath),
})


/*::
export type TerrainPlacementID = string;
export type TerrainPlacement = {
  id: TerrainPlacementID,
  layer: EditingLayerID,
  position: MiniVector,
  quaternion: MiniQuaternion,
  terrainPropId: TerrainPropID,
}
*/
export const castTerrainPlacementId/*: Cast<TerrainPlacementID>*/ = c.str;
export const castTerrainPlacement/*: Cast<TerrainPlacement>*/ = c.obj({
  id: castTerrainPlacementId,
  layer: castEditingLayerID,
  position: castMiniVector,
  quaternion: castMiniQuaternion,
  terrainPropId: castTerrainPropId,
});

export const createFloorForTerrain = (
  terrainType/*: string*/,
  terrainPosition/*: BoardPosition*/,
  visible/*: boolean*/ = false
)/*: BoardArea[]*/ => {
  if (!visible)
    return [];

  switch (terrainType) {
    case 'box':
      return [
        { type: 'box', box: {
          position: { ...terrainPosition, z: terrainPosition.z + 1 }, size: { x: 3, y: 3, z: 1 } 
        } }
      ];
    case 'WoodenPlatform':
      return [
        { type: 'box', box: {
          position: { ...terrainPosition, z: terrainPosition.z + 1 }, size: { x: 1, y: 1, z: 1 } 
        } }
      ];
    default:
      return [];
  }
}