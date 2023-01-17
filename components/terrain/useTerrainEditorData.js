// @flow strict
/*::
import type {
  TerrainProp,
  TerrainPropNode,
  TerrainPropNodeID,
  TerrainPropNodePath
} from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../miniTheater/useMiniTheaterResources";
import type { WildspaceClientServices } from "../services/wildspaceController";
*/

import { useMemo, useState } from "@lukekaalim/act";
import { v4 } from "uuid";
import { Quaternion, Vector3, Matrix4 } from "three";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../utils/miniVector";
import { useWildspaceClientServices } from "../services/wildspaceController";

/*::
export type TerrainEditorData = {
  state: TerrainEditorState,
  terrainProp: TerrainProp,
  resources: MiniTheaterRenderResources,
  services: WildspaceClientServices,

  dispatch: TerrainEditorAction => void,

  nodeMap: Map<TerrainPropNodeID, TerrainPropNode>,
  matrixMap: Map<TerrainPropNodeID, Matrix4>,
}

export type TerrainEditorState = {
  selectedNodeId: ?TerrainPropNodeID,
  selectedNodePath: ?TerrainPropNodePath,
  selectedTransformTool: 'none' | 'translate' | 'rotate' | 'scale',
};
export type TerrainEditorAction =
  | { type: 'select', nodePath: TerrainPropNodePath }
  | { type: 'deselect' }
  | { type: 'switch-tool', tool: 'none' | 'translate' | 'rotate' | 'scale' }
  | { type: 'set-prop', terrainProp: TerrainProp }
  | { type: 'add-node', title: string, nodeType: string, parent: ?TerrainPropNodeID }
  | { type: 'remove-node', nodeId: TerrainPropNodeID }
;
*/
const applyTerrainEditorAction = (
  state/*: TerrainEditorState*/,
  action/*: TerrainEditorAction*/
)/*: TerrainEditorState*/ => {
  switch (action.type) {
    case 'select':
      return { ...state, selectedNodePath: action.nodePath, selectedNodeId: action.nodePath[action.nodePath.length - 1] };
    case 'deselect':
      return { ...state, selectedNodePath: null, selectedNodeId: null };
    case 'switch-tool':
      return { ...state, selectedTransformTool: action.tool };
    case 'add-node':
    default:
      return state;
  }
}
const createNewNode = (
  type,
  name,
  parent
)/*: TerrainPropNode*/ => {
  const id = v4();
  const meta = {
    id,
    name,
    path: parent ? [...parent.meta.path, id] : [id]
  };
  switch (type) {
    case 'transform':
      return {
        meta,
        type: 'transform',
        children: [],
        position: { ...new Vector3() },
        quaternion: { ...new Quaternion() }
      };
    case 'model':
      return {
        meta,
        type: 'model',
        path: [],
        modelId: '',
      }
    case 'camera':
      return {
        meta,
        type: 'camera',
      }
    case 'floor':
      return {
        meta,
        type: 'floor',
        floorShape: {
          type: 'box',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          size: { x: 10, y: 10, z: 10 },
        }
      }
    default:
      throw new Error();
  }
};

const applyTerrainEditorActionToProp = (
  state/*: TerrainEditorState*/,
  action/*: TerrainEditorAction*/,
  terrainProp/*: TerrainProp*/,
  nodeMap/*: Map<TerrainPropNodeID, TerrainPropNode>*/
)/*: TerrainProp*/ => {
  switch (action.type) {
    case 'set-prop':
      return action.terrainProp;
    case 'add-node':
      const parent = !!action.parent && nodeMap.get(action.parent) || null;
      const node = createNewNode(action.nodeType, action.title, parent);
      if (parent)
        return {
          ...terrainProp,
          nodes: [
            ...terrainProp.nodes
              .map(n => n.meta.id === action.parent && n.type === 'transform' ? {
                ...n,
                children: [...n.children, node.meta.id]
              } : n),
            node,
          ],
        };
      else
        return {
          ...terrainProp,
          nodes: [...terrainProp.nodes, node],
          rootNodes: [...terrainProp.rootNodes, node.meta.id]
        }
    case 'remove-node':
      return {
        ...terrainProp,
        nodes: terrainProp.nodes.filter(n => !n.meta.path.includes(action.nodeId)),
        rootNodes: terrainProp.rootNodes.filter(n => n !== action.nodeId),
      }
    default:
      return terrainProp;
  }
}

export const useTerrainEditorData = (
  terrainProp/*: TerrainProp*/,
  resources/*: MiniTheaterRenderResources*/,
  onTerrainPropChange/*: TerrainProp => mixed*/ = _ => {},
)/*: TerrainEditorData*/ => {
  const [editorState, setEditorState] = useState/*:: <TerrainEditorState>*/({
    selectedNodeId: null,
    selectedNodePath: null,
    selectedTransformTool: 'none',
  })

  const nodeMap = useMemo(
    () => new Map(terrainProp.nodes.map(n => [n.meta.id, n])),
    [terrainProp]
  );

  const matrixMap = useMemo(() => new Map([...nodeMap.values()]
    .map(n => {
      switch (n.type) {
        case 'transform':
          return [n.meta.id, new Matrix4().compose(
            miniVectorToThreeVector(n.position),
            miniQuaternionToThreeQuaternion(n.quaternion),
            new Vector3(1, 1, 1),
          )];
        default:
          return null;
      }
    })
    .filter(Boolean)
  ), [terrainProp]);

  const dispatch = (action) => {
    setEditorState(state => {
      const nextTerrainProp = applyTerrainEditorActionToProp(state, action, terrainProp, nodeMap);
      if (nextTerrainProp !== terrainProp)
        onTerrainPropChange(nextTerrainProp)
      return applyTerrainEditorAction(state, action);
    });
  }
  const services = useWildspaceClientServices();

  const data =  useMemo(() => ({
    nodeMap,
    dispatch,
    state: editorState,
    terrainProp,
    resources,
    matrixMap,
    services,
  }), [editorState, terrainProp, onTerrainPropChange]);

  return data;
}