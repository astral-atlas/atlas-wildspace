// @flow strict
/*::
import type {
  TerrainProp,
  TerrainPropID,
  TerrainPropNodeID,
} from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../miniTheater/useMiniTheaterResources";
import type { Object3D } from "three";
*/

import { Group, PerspectiveCamera } from "three";
import { getObject3DForModelResourcePath } from "../resources/modelResourceUtils";
import { miniQuaternionToThreeQuaternion, miniVectorToThreeVector } from "../utils";

export const createTerrainPropGroup = (
  prop/*: TerrainProp*/,
  resources/*: MiniTheaterRenderResources*/,
  visitedProps/*: Set<TerrainPropID>*/ = new Set(),
)/*: [Object3D, Map<TerrainPropNodeID, Object3D>]*/ => {
  const nodeObjects = new Map();
  const nodeMap = new Map(prop.nodes.map(n => [n.meta.id, n]));
  console.log(nodeMap);

  const root = new Group();
  visitedProps.add(prop.id);

  const createNodeObject = (node) => {
    console.log(`Requesting object for: ${node.meta.id}`)
    switch (node.type) {
      case 'model':
        const model = resources.modelResources.get(node.modelId)
        if (!model)
          return null;
        const modelObject = resources.objectMap.get(model.assetId)
        if (!modelObject)
          return null;
        const pathObject = getObject3DForModelResourcePath(modelObject, node.path);
        if (!pathObject)
          return null;
        const clonedPathObject = pathObject.clone(true);
        console.log(`Setting`, node.meta.id, clonedPathObject);
        nodeObjects.set(node.meta.id, clonedPathObject);
        return clonedPathObject;
      case 'transform':
        const groupObject = new Group()
        const children = node.children
          .map(id => nodeMap.get(id))
          .map(node => node && createNodeObject(node))
          .filter(Boolean)
        console.log('transform children', node.children, children)
        if (children.length > 0)
          groupObject.add(...children)
        groupObject.position.copy(miniVectorToThreeVector(node.position));
        groupObject.quaternion.copy(miniQuaternionToThreeQuaternion(node.quaternion));
        console.log(`Setting`, node.meta.id, groupObject);
        nodeObjects.set(node.meta.id, groupObject);
        return groupObject;
      case 'prop':
        if (visitedProps.has(node.propId))
          return null;
        const prop = resources.terrainProps.get(node.propId);
        if (!prop)
          return null;
        const [propObject] = createTerrainPropGroup(prop, resources, visitedProps);
        console.log(`Setting`, node.meta.id, propObject);
        nodeObjects.set(node.meta.id, propObject);
        return propObject;
      case 'camera':
        const cameraObject = new PerspectiveCamera();
        console.log(`Setting`, node.meta.id, cameraObject);
        nodeObjects.set(node.meta.id, cameraObject);
        return cameraObject;
      default:
        console.log('Returning null because default')
        return null;
    }
  }
  
  const objects = prop.rootNodes
    .map(id => nodeMap.get(id))
    .map(node => node && createNodeObject(node))
    .filter(Boolean)
  console.log('Root nodes', objects, prop.rootNodes)
  
  if (objects.length > 0)
    root.add(...objects)

  return [root, nodeObjects];
};
