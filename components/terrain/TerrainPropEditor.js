// @flow strict
/*::
import type {
  TerrainProp,
  TerrainPropNode,
  TerrainPropNodeID,
  TerrainPropNodePath,
} from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { Object3D } from "three";

import type { MiniTheaterRenderResources } from "../miniTheater/useMiniTheaterResources";
*/

import { FreeCamera } from "../camera/FreeCamera";
import { RenderCanvas } from "../three/RenderCanvas";
import { h, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { TerrainEditorSnackbar } from "./TerrainEditorSnackbar";
import { useElementKeyboard } from "../keyboard";
import { useKeyboardTrack } from "../keyboard/track";

import styles from './TerrainEditor.module.css';
import {
  Camera,
  CameraHelper,
  Color,
  GridHelper,
  LineBasicMaterial,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { ShapeRenderer } from "../miniTheater/floor/ShapeRenderer";
import {
  raycastManagerContext,
  useRaycast2,
  useRaycastManager,
} from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { useRaycastLoop } from "../raycast/useRaycastLoop";
import { useChildObject, useLoopController } from "../three";
import { useTransformControls } from "../gizmos/useTransformControls";
import { group, useDisposable } from "@lukekaalim/act-three";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
  quaternionToMiniQuaternion,
  vectorToMiniVector,
} from "../utils/miniVector";
import { getObject3DForModelResourcePath } from "../resources/modelResourceUtils";
import { createTerrainPropObject } from "../miniTheater/terrain/terrainProp";
import {
  raycastManager2Context,
  useRaycastManager2,
} from "../raycast/manager2";
import { TransformControls } from "../gizmos";
import { useTerrainEditorData } from "./useTerrainEditorData";
import { Overlay } from "./sidebar/Overlay";
import {
  BoxHelperGroup,
  GridHelperGroup,
} from "../../docs/src/controls/helpers";
import { c } from "@lukekaalim/cast/shorthand";
import { FloorMesh } from "../miniTheater/floor/FloorMesh";
import { createFloorForTerrain } from "../../models/game/miniTheater/terrain";
import { CameraNode } from "./editor";

/*::
export type TerrainEditorProps = {
  terrainProp: TerrainProp,
  resources: MiniTheaterRenderResources,

  onTerrainPropChange?: TerrainProp => mixed,
};
*/


const TerrainPropModelNodeEditor = ({ node, editorData, nodeEvents, data }) => {
  const modelResource = editorData.resources.modelResources.get(node.modelId);
  if (!modelResource)
    return null;
  const modelAsset = editorData.resources.objectMap.get(modelResource.assetId);
  if (!modelAsset)
    return null;
  const modelObject = getObject3DForModelResourcePath(modelAsset, node.path);
  if (!modelObject)
    return null;
  
  const modelObjectInstance = useMemo(() => {
    const modelObjectInstance = modelObject.clone(true);
    // Reset position and rotation to defaults (but keep scale).
    modelObjectInstance.quaternion.identity();
    modelObjectInstance.position.set(0, 0, 0);
    return modelObjectInstance;
  }, [modelObject]);

  const ref = useRef();

  useEffect(() => {
    const { unsubscribe } = data.raycast.subscribeTarget({
      object: modelObjectInstance,
      recursive: true,
      onEnter: () => nodeEvents.onEnter(node),
      onExit: () => nodeEvents.onExit(node),
    });

    return () => {
      unsubscribe();
    }
  }, [node, modelObjectInstance, nodeEvents, data])

  return h(group, {
    ref,
    group: modelObjectInstance,
    name: node.meta.name || modelObjectInstance.name
  });
}
const options =  { rotationSnap: null };

const TerrainPropTransformNodeEditor = ({ node, editorData, nodeEvents, data }) => {
  const { position, quaternion } = useMemo(() => {
    return {
      position: miniVectorToThreeVector(node.position),
      quaternion: miniQuaternionToThreeQuaternion(node.quaternion),
    }
  }, [node]);
  const ref = useRef();

  const selectedNode =
    editorData.state.selectedNodeId
    && editorData.nodeMap.get(editorData.state.selectedNodeId)
    || null;

  const controlsEnabled = !!selectedNode && selectedNode.meta.path.includes(node.meta.id);
  const selectedControls = editorData.state.selectedTransformTool;
  const transformControls = ['translate', 'rotate']
  const currentControlMode = transformControls.find(c => c === selectedControls) || 'translate'

  const controls = useTransformControls(ref, currentControlMode, controlsEnabled, {
    change({ position, quaternion }) {
      const nextTerrainProp = {
        ...editorData.terrainProp,
        nodes: editorData.terrainProp.nodes.map(n => {
          if (node.meta.id !== n.meta.id)
            return n;
          return {
            ...node,
            position: vectorToMiniVector(position),
            quaternion: quaternionToMiniQuaternion(quaternion),
          }
        })
      };
      editorData.dispatch({ type: 'set-prop', terrainProp: nextTerrainProp })
    },
    changeFinish({ position, quaternion }) {
    }
  }, [editorData.dispatch, editorData.terrainProp], options);
  useEffect(() => {
    if (!controls)
      return;
      
    const unsubscribers = Object.keys(controls._gizmo.picker).map(key => {
      const object = controls._gizmo.picker[key];
      const { unsubscribe } = data.controlsRaycast.subscribeTarget({
        object,
        recursive: true,
        onEnter: (i) => nodeEvents.onEnterControls(),
        onExit: (i) =>  nodeEvents.onExitControls(),
      });
      return unsubscribe;
    })

    return () => {
      for (const unsubscribe of unsubscribers)
        unsubscribe();
    }
  }, [node, controls, data, controlsEnabled])

  return h(group, { position, ref, quaternion, name: node.meta.name || '' },
    node.children
      .map(nc => editorData.nodeMap.get(nc))
      .filter(Boolean)
      .map(node => h(TerrainPropNodeEditor, { key: node.meta.id, node, editorData, nodeEvents, data }))
  )
};

const TerrainPropNodeEditor = ({ node, editorData, nodeEvents, data }) => {
  const ref = useRef();
  switch (node.type) {
    case 'model':
      return h(TerrainPropModelNodeEditor, { node, editorData, nodeEvents, data })
    case 'camera':
      return h(CameraNode, { editor: editorData, node });
    case 'transform':
      return h(TerrainPropTransformNodeEditor, { node, editorData, nodeEvents, data })
    case 'floor':
      const { position: p, size: s } = node.floorShape
      return h(BoxHelperGroup, { center: [p.x, p.y, p.z], ref, size: [s.x, s.y, s.z] })
    default:
      return null;
  }
};

export const TerrainPropEditor/*: Component<TerrainEditorProps>*/ = ({
  terrainProp,
  onTerrainPropChange,
  resources,
}) => {
  const nodeMap = useMemo(() =>
    new Map(terrainProp.nodes.map(n => [n.meta.id, n])), [terrainProp.nodes]);

  const cameraButtonRef = useRef();
  const emitter = useElementKeyboard(cameraButtonRef);
  const keys = useKeyboardTrack(emitter);
  
  const editorData = useTerrainEditorData(terrainProp, resources, onTerrainPropChange);

  const loop = useLoopController();
  const canvasRef = useRef();
  const raycast = useRaycastManager2(loop, canvasRef);
  const controlsRaycast = useRaycastManager2(loop, canvasRef);

  //const cameraMatrix = modelResourcePropCamera && modelResourcePropCamera.matrixWorld;
  //const cameraPosition = cameraMatrix && new Vector3().setFromMatrixPosition(cameraMatrix);
  //const cameraQuaternion = cameraMatrix && new Quaternion().setFromRotationMatrix(cameraMatrix);

  const rootNodes = terrainProp.rootNodes
    .map(rn => nodeMap.get(rn))
    .filter(Boolean);

  const [hoveringNode, setHoveringNode] = useState/*:: <?TerrainPropNode>*/(null);
  const [hoveringControls, setHoveringControls] = useState(false);

  const nodeEvents = useMemo(() => {
    const onEnter = (node) => {
      setHoveringNode(node);
    };
    const onExit = (node) => {
      setHoveringNode(n => n === node ? null : n);
    };
    const onEnterControls = () => {
      setHoveringControls(true);
    };
    const onExitControls = () => {
      setHoveringControls(false)
    };
    return { onEnter, onExit, onEnterControls, onExitControls };
  }, []);

  const data = useMemo(() => {
    return { controlsRaycast, raycast }
  }, [controlsRaycast])

  const onPointerDown = () => {
    if (hoveringControls)
      return;
    if (!hoveringNode)
      editorData.dispatch({ type: 'deselect' })
    else
      editorData.dispatch({ type: 'select', nodePath: hoveringNode.meta.path })
  }

  const cameraPosition = new Vector3(50, 50, 50);
  const cameraMatrix = new Matrix4()
  cameraMatrix.setPosition(cameraPosition);
  cameraMatrix.lookAt(cameraPosition, new Vector3(0, 0, 0), new Vector3(0, 1, 0))
  const cameraQuaternion = new Quaternion().setFromRotationMatrix(cameraMatrix);
  cameraPosition.add(new Vector3(25, 0, -10))
  
  const floorShapes = [...nodeMap.values()]
    .map(n => {
      switch (n.type) {
        case 'floor':
          const { floorShape } = n;
          const parentTransforms = n.meta.path
            .map(id => editorData.matrixMap.get(id))
            .filter(Boolean);
          const matrix = parentTransforms.reduce((acc, curr) => {
            acc.multiply(curr);
            return acc;
          }, new Matrix4().identity())
          const position = new Vector3().setFromMatrixPosition(matrix);
          const quaternion = new Quaternion().setFromRotationMatrix(matrix);
          return {
            type: 'box',
            size: floorShape.size,
            position: vectorToMiniVector(position),
            rotation: quaternionToMiniQuaternion(quaternion)
          }
        default:
          return null;
      }
    })
    .filter(Boolean);

  return h('div', {}, [
    h(RenderCanvas, {
      renderSetupOverrides: { keyboardEmitter: emitter, canvasRef, loop },
      className: styles.terrainEditorCanvas,
      canvasProps: { onPointerDown }
    }, [
      rootNodes.map(node =>
        h(TerrainPropNodeEditor, { key: node.meta.id, node, editorData, nodeEvents, data })),
      //!!modelResourcePropCamera && h(CameraHelperRenderer, { camera: modelResourcePropCamera }),
      h(FloorMesh, { floors: floorShapes, showDebug: true }),
      h(FreeCamera, {
        key: 'camera',
        surfaceRef: cameraButtonRef,
        keys,
        position: cameraPosition,
        quaternion: cameraQuaternion,
      }),
      h(GridHelperGroup, { }),
    ]),
    h(Overlay, { editor: editorData, cameraSurfaceRef: cameraButtonRef })
  ]);
}

const CameraHelperRenderer = ({ camera }) => {
  const ref = useRef();
  useChildObject(ref, () => {
    console.log(camera)
    if (!(camera instanceof Camera))
      return;
    return new CameraHelper(camera)
  }, [camera])
  return [
    h(group, { ref }),
  ]
}

const ShapeEditor = ({ shape, selected, raycast, onSelect, onShapeChange, tool }) => {
  const ref = useRef();

  useTransformControls(ref, tool === 'none' ? 'translate': tool, tool !== 'none' && selected, {
    change: (object) => {
      onShapeChange({
        ...shape,
        position: vectorToMiniVector(object.position),
        rotation: quaternionToMiniQuaternion(object.quaternion),
        size: vectorToMiniVector(object.scale),
      })
    }
  }, [onShapeChange])

  const material = useDisposable(() => new LineBasicMaterial({ color: new Color('grey') }))
  useRaycast2(raycast, ref, {
    enter() {
      material.color = new Color('white')
    },
    exit() {
      material.color = new Color('grey')
    },
    click() {
      onSelect()
    }
  }, [onSelect])

  return h(ShapeRenderer, { shape, ref, material })
}