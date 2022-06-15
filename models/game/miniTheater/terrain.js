// @flow strict
/*::
import type { BoardArea } from "../../encounter/board";
*/


export const createFloorForTerrain = (
  terrainType,
  terrainPosition,
  visible
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
  }
}