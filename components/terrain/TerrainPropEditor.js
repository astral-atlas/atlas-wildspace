// @flow strict
/*::
import type { TerrainProp } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act/component";
import type { Object3D } from "three";
*/

import { FreeCamera } from "../camera/FreeCamera";
import { FloorMesh } from "../miniTheater/floor/FloorMesh";
import { FloorShapeEditor } from "../miniTheater/floor/FloorShapeEditor";
import { ModelResourceObject } from "../resources/ModelResourceObject";
import { RenderCanvas } from "../three/RenderCanvas";
import { h, useRef, useState } from "@lukekaalim/act";
import { TerrainEditorSnackbar } from "../snackbar/TerrainEditorSnackbar";
import { useElementKeyboard } from "../keyboard";
import { useKeyboardTrack } from "../keyboard/track";

import styles from './TerrainEditor.module.css';
import { Color, LineBasicMaterial, Quaternion, Vector3 } from "three";
import { ShapeRenderer } from "../miniTheater/floor/ShapeRenderer";
import { useRaycast2, useRaycastManager } from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { useRaycastLoop } from "../raycast/useRaycastLoop";
import { useLoopController } from "../three";
import { useTransformControls } from "../gizmos/useTransformControls";
import { useDisposable } from "@lukekaalim/act-three";
import { quaternionToMiniQuaternion, vectorToMiniVector } from "../utils/miniVector";

/*::
export type TerrainEditorProps = {
  terrainProp: TerrainProp,
  modelResourceObject: Object3D,
  onTerrainPropChange?: TerrainProp => mixed,
};

export type TerrainEditorState = {
  tool: 'none' | 'translate' | 'rotate' | 'scale',
  selectedShapeIndex: number,
};
*/
const initialTerrainEditorState = {
  selectedShapeIndex: -1,
  tool: 'translate',
}

export const TerrainPropEditor/*: Component<TerrainEditorProps>*/ = ({
  terrainProp,
  onTerrainPropChange,
  modelResourceObject
}) => {
  const cameraButtonRef = useRef();
  const emitter = useElementKeyboard(cameraButtonRef);
  const keys = useKeyboardTrack(emitter);
  const [
    terrainEditorState,
    setTerrainEditorState
  ] = useState/*:: <TerrainEditorState>*/(initialTerrainEditorState);

  const { floorShapes } = terrainProp;
  const onShapeSelect = (index) => () => {
    setTerrainEditorState({
      ...terrainEditorState,
      selectedShapeIndex: index,
    })
  }
  const onFloorChange = (index) => (updatedShape) => {
    onTerrainPropChange && onTerrainPropChange({
      ...terrainProp,
      floorShapes: terrainProp.floorShapes.map((shape, shapeIndex) => {
        if (shapeIndex !== index)
          return shape;
        return updatedShape;
      })
    })
  }
  const raycast = useRaycastManager()
  const loop = useLoopController()
  const canvasRef = useRef()
  useRaycastElement(raycast, canvasRef);
  useRaycastLoop(raycast, loop);
  const onClick = () => {
    if (raycast.lastIntersectionRef.current === null)
      setTerrainEditorState({ ...terrainEditorState, selectedShapeIndex: 0 })
  }

  return h('div', {}, [
    h(RenderCanvas, {
      renderSetupOverrides: { keyboardEmitter: emitter, canvasRef, loop },
      className: styles.terrainEditorCanvas,
      canvasProps: { onClick }
    }, [
      h(ModelResourceObject, {
        object: modelResourceObject,
        position: new Vector3(0, 0, 0),
        quaternion: new Quaternion().identity()
      }),
      h(FloorMesh, { floors: floorShapes, showDebug: true }),
      h(FreeCamera, { surfaceRef: cameraButtonRef, keys }),
      floorShapes.map((shape, index) => {
        const selected = index === terrainEditorState.selectedShapeIndex;
        return h(ShapeEditor, {
          shape, selected, raycast,
          tool: terrainEditorState.tool,
          onSelect: onShapeSelect(index),
          onShapeChange: onFloorChange(index)
        })
      })
    ]),
    h(TerrainEditorSnackbar, {
      cameraButtonRef,
      editorState: terrainEditorState,
      terrainProp,
      onTerrainPropChange,
      onEditorStateChange: setTerrainEditorState
    }),
  ]);
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