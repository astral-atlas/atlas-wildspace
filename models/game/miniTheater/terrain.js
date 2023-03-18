// @flow strict
/*::
import type { BoardArea } from "../../encounter/board";
import type { BoardPosition } from "../../encounter/map";
import type { EditingLayerID } from "./editingLayer.js";
import type {
  ModelResourceID,
  ModelResourcePath,
} from "../resources/index.js";
import type { MiniQuaternion, MiniVector } from "./primitives";
import type { Cast } from "@lukekaalim/cast";
import type { MiniTheaterShape } from "./shape";
import type { GameMetaResource } from "../meta";
*/

import { c } from "@lukekaalim/cast";
import { castModelResourceId, castModelResourcePath } from "../resources/index.js";
import { castEditingLayerID } from "./editingLayer.js";
import { castMiniQuaternion, castMiniVector } from "./primitives.js";
import { castMiniTheaterShape } from "./shape.js";
import { castGameMetaResource } from "../meta.js";
import { createTypedUnionCastList } from "../../castTypedUnion.js";

/*::
export type TerrainPropID = string;
export type TerrainProp = GameMetaResource<{
  nodes: $ReadOnlyArray<TerrainPropNode>,
  rootNodes: $ReadOnlyArray<TerrainPropNodeID>,
  iconCameraId: null | TerrainPropNodeID,
}, TerrainPropID>;

export type TerrainPropNodeID = string;
export type TerrainPropNodePath = $ReadOnlyArray<TerrainPropNodeID>;
export type TerrainPropNodeMeta = {|
  name: null | string,
  id: TerrainPropNodeID,
  path: TerrainPropNodePath,
|};

export type TerrainPropModelNode = {|
  type: 'model',
  modelId: ModelResourceID,
  path: ModelResourcePath,
  meta: TerrainPropNodeMeta
|};
export type TerrainPropTransformNode = {|
  type: 'transform',
  position: MiniVector,
  quaternion: MiniQuaternion,
  children: $ReadOnlyArray<TerrainPropNodeID>,
  meta: TerrainPropNodeMeta
|};

export type TerrainPropNodes = {
  'floor': {| type: 'floor', floorShape: MiniTheaterShape, meta: TerrainPropNodeMeta |},
  'prop': {| type: 'prop', propId: TerrainPropID, meta: TerrainPropNodeMeta |},
  'camera': {| type: 'camera', meta: TerrainPropNodeMeta |},
  'transform': TerrainPropTransformNode,
  'model': TerrainPropModelNode,
}

export type TerrainPropNode = (
  | TerrainPropNodes["camera"]
  | TerrainPropModelNode
  | TerrainPropNodes["floor"]
  | TerrainPropNodes["prop"]
  | TerrainPropTransformNode
);
*/
export const castTerrainPropNodeId/*: Cast<TerrainPropNodeID>*/ = c.str;
export const castTerrainPropNodePath/*: Cast<TerrainPropNodePath>*/ = c.arr(castTerrainPropNodeId);
export const castTerrainPropNodeMeta/*: Cast<TerrainPropNodeMeta>*/ = c.obj({
  name: c.maybe(c.str),
  id: castTerrainPropNodeId,
  path: castTerrainPropNodePath,
});

const castFloorNode = c.obj({
  type: c.lit('floor'),
  floorShape: castMiniTheaterShape,
  meta: castTerrainPropNodeMeta,
})
const castModelNode = c.obj({
  type: c.lit('model'),
  modelId: castModelResourceId,
  path: castModelResourcePath,
  meta: castTerrainPropNodeMeta,
});
const castPropNode = c.obj({
  type: c.lit('prop'),
  propId: castTerrainPropNodeId,
  meta: castTerrainPropNodeMeta,
});
const castTransformNode = c.obj({
  type: c.lit('transform'),
  position: castMiniVector,
  quaternion: castMiniQuaternion,
  children: c.arr(castTerrainPropNodeId),
  meta: castTerrainPropNodeMeta,
})
export const castTerrainPropNode/*: Cast<TerrainPropNode>*/ = createTypedUnionCastList([
  ['floor', castFloorNode],
  ['model', castModelNode],
  ['prop', castPropNode],
  ['transform', castTransformNode],
]);

export const castTerrainPropId/*: Cast<TerrainPropID>*/ = c.str;
export const castTerrainProp/*: Cast<TerrainProp>*/ = castGameMetaResource(castTerrainPropId, c.obj({
  nodes: c.arr(castTerrainPropNode),
  rootNodes: c.arr(castTerrainPropNodeId),
  iconCameraId: c.maybe(castTerrainPropNodeId),
}))

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

export const getNodeChain = (
  nodeMap/*: Map<TerrainPropNodeID, TerrainPropNode>*/,
  nodePath/*: TerrainPropNodePath*/,
  nodePathOffset/*: number*/ = 0,
)/*: TerrainPropNode[]*/ => {
  const id = nodePath[nodePathOffset];
  const node = nodeMap.get(id);
  if (!node)
    throw new Error();
  if (nodePathOffset === nodePath.length - 1)
    return [node];
  return [node, ...getNodeChain(nodeMap, nodePath, nodePathOffset + 1)];
}