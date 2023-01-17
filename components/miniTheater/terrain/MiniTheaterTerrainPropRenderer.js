// @flow strict
/*::
import type { TerrainProp, TerrainPropID } from "@astral-atlas/wildspace-models";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../useMiniTheaterController2";
import type { Component, Ref } from "@lukekaalim/act";
import type { Object3D, Quaternion, Vector3 } from "three";
import type { ReadOnlyRef } from "../../three/useChildObject";
*/
import { h, useMemo } from "@lukekaalim/act";
import { group } from "@lukekaalim/act-three";
import { miniQuaternionToThreeQuaternion, miniVectorToThreeVector } from "../../utils";
import { ModelResourceObject } from "../../resources/ModelResourceObject";
import { getObject3DForModelResourcePath } from "../../resources/modelResourceUtils";

/*::
export type MiniTheaterTerrainPropRendererProps = {
  ref?: Ref<?Object3D>,
  state: MiniTheaterLocalState,

  terrainProp: TerrainProp,
}
*/

export const MiniTheaterTerrainPropRenderer/*: Component<MiniTheaterTerrainPropRendererProps>*/ = ({
  ref,
  state,
  terrainProp,
}) => {
  const nodeMap = useMemo(() =>
    new Map(terrainProp.nodes.map(node => [node.meta.id, node])), [terrainProp.nodes])

  return h(group, { ref }, terrainProp.rootNodes.map(nodeId => {
    const node = nodeMap.get(nodeId)
    return !!node && h(MiniTheaterTerrainNodeRenderer, { node, state, nodeMap })
  }));
};

const MiniTheaterTerrainNodeRenderer = ({ node, state, nodeMap }) => {
  switch (node.type) {
    case 'transform':
      return h(group, {
        position: miniVectorToThreeVector(node.position),
        quaternion: miniQuaternionToThreeQuaternion(node.quaternion),
      }, node.children.map(nodeId => {
       const node = nodeMap.get(nodeId);
       return !!node && h(MiniTheaterTerrainNodeRenderer, { node, state, nodeMap })
      }))
    case 'prop':
      const terrainProp = state.resources.terrainProps.get(node.propId);
      if (!terrainProp)
        return null;
      return h(MiniTheaterTerrainPropRenderer, { state, terrainProp })
    case 'model':
      const model = state.resources.modelResources.get(node.modelId);
      const root = model && state.resources.objectMap.get(model.assetId);
      const object = root && getObject3DForModelResourcePath(root, node.path);
      if (!object)
        return null;
      return h(ModelResourceObject, { object });
    default:
      return null;
  };
};
