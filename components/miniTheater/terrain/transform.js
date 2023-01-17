// @flow strict
/*::
import type { TerrainProp, TerrainPropNode, TerrainPropNodeID } from "@astral-atlas/wildspace-models";
*/
import { getNodeChain } from "@astral-atlas/wildspace-models";
import { Matrix4, Vector3 } from "three";
import { miniQuaternionToThreeQuaternion, miniVectorToThreeVector } from "../../utils";

export const createTransformMatrixForTerrainPropNode = (
  prop/*: TerrainProp*/,
  nodeId/*: TerrainPropNodeID*/,
)/*: Matrix4*/ => {
  const nodeMap = new Map(prop.nodes.map(n => [n.meta.id, n]));
  const node = nodeMap.get(nodeId);
  if (!node)
    throw new Error();
  const chain = getNodeChain(nodeMap, node.meta.path);
  const matrixStack = chain.map(node => {
    switch (node.type) {
      case 'transform':
        return new Matrix4().compose(
          miniVectorToThreeVector(node.position),
          miniQuaternionToThreeQuaternion(node.quaternion),
          new Vector3(1, 1, 1));
      default:
        return null;
    }
  }).filter(Boolean);
  
  const matrix = new Matrix4().identity();
  for (const matrixInStack of matrixStack) {
    matrix.multiply(matrixInStack);
  }
  return matrix;
};