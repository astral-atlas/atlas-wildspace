// @flow strict

/*::
import type { TerrainProp } from "../../../models/game/miniTheater/terrain";
import type {
  TerrainPropNodeID, TerrainPropNode,
  ModelResource,
  ModelResourceID,
} from "@astral-atlas/wildspace-models";
import type {
  MiniTheaterRenderResources,
} from "../useMiniTheaterResources";
import type { Object3D } from "three";
*/

import { Group, Vector3 } from "three";
import { miniVectorToThreeVector, miniQuaternionToThreeQuaternion } from "../../utils";
import { getObject3DForModelResourcePath } from "../../resources/modelResourceUtils";

export const createTerrainPropObject = (
  prop/*: TerrainProp*/,
  resources/*: MiniTheaterRenderResources*/,
)/*: Object3D*/ => {
  const root = new Group();
  const nodeMap = new Map(prop.nodes.map(n => [n.meta.id, n]));
  const children = prop.rootNodes
    .map(nodeId => createTerrainPropNode(nodeId, nodeMap, resources))
    .filter(Boolean);
  if (children.length > 0)
    root.add(...children);
  return root;
}

export const createTerrainPropNode = (
  nodeId/*: TerrainPropNodeID*/,
  nodeMap/*: Map<TerrainPropNodeID, TerrainPropNode>*/,
  resources/*: MiniTheaterRenderResources*/,
)/*: ?Object3D*/ => {
  const node = nodeMap.get(nodeId);
  if (!node)
    return null;
  switch (node.type) {
    case 'model':
      const modelResource = resources.modelResources.get(node.modelId);
      if (!modelResource)
        return null;
      const modelAsset = resources.objectMap.get(modelResource.assetId);
      if (!modelAsset)
        return null;
      const modelObject = getObject3DForModelResourcePath(modelAsset, node.path);
      if (!modelObject)
        return null;
      const modelObjectInstance = modelObject.clone(true);
      // Reset position and rotation to defaults (but keep scale).
      modelObjectInstance.quaternion.identity();
      modelObjectInstance.position.set(0, 0, 0);

      modelObjectInstance.name = node.meta.name || modelObjectInstance.name;
      return modelObjectInstance;
    case 'transform':
      const group = new Group();
      group.position.copy(miniVectorToThreeVector(node.position));
      group.quaternion.copy(miniQuaternionToThreeQuaternion(node.quaternion));
      const transformedNodes = node.children
        .map(nodeId => createTerrainPropNode(nodeId, nodeMap, resources))
        .filter(Boolean)
      if (transformedNodes.length > 0)
        group.add(...transformedNodes);
      group.name = node.meta.name || group.name;
      return group;
    case 'prop':
      const prop = resources.terrainProps.get(node.propId);
      if (!prop)
        return null;
      return createTerrainPropObject(prop, resources);
    default:
      return null;
  }
};