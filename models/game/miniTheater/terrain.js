// @flow strict
/*::
import type { BoardArea } from "../../encounter/board";
import type { BoardPosition } from "../../encounter/map";
import type {
  ModelResourceID,
  ModelResourcePath,
  TextureResourceID,
} from "../resources";
import type { Cast } from "@lukekaalim/cast";
*/

import { castModelResourceId, castModelResourcePath } from "../resources.js";
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