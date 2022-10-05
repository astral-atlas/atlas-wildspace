// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterShape } from "@astral-atlas/wildspace-models";
*/
import { h, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group, lineSegments, mesh, useDisposable } from "@lukekaalim/act-three";

import {
  BoxGeometry,
  Quaternion,
  Vector3,
  EdgesGeometry,
  LineBasicMaterial,
  Matrix4,
  Box3,
  Box3Helper,
  AxesHelper,
} from "three";
import { css2dObject } from "../../renderer";
import { EditorForm, SelectEditor } from "../../editor/form";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { renderCanvasContext } from "../../three/RenderCanvas";
import { BoxHelperGroup } from "../../../docs/src/controls/helpers";
import { useChildObject } from "../../three/useChildObject";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
  vectorSetMini,
} from "../../utils/miniVector";

/*::
export type FloorShapeEditorProps = {
  floor: MiniTheaterShape,
  onFloorChange: MiniTheaterShape => mixed,
}
*/

const lineMaterial = new LineBasicMaterial();

export const FloorShapeEditor/*: Component<FloorShapeEditorProps>*/ = ({
  floor,
  onFloorChange,
}) => {
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;
  
  const ref = useRef();
  const gizmoRef = useRef();
  const buttonRef = useRef()

  const [controls, setControls] = useState(null);
  useEffect(() => {
    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    const { current: parent } = ref;
    const { current: gizmo } = gizmoRef;

    if (!camera || !canvas || !parent || !gizmo)
      return; 
    const controls = new TransformControls(camera, canvas);
    parent.add(controls);
    controls.attach(gizmo);
    setControls(controls);
    return () => {
      controls.removeFromParent();
    };
  }, []);
  useEffect(() => {
    const { current: button } = buttonRef;
    const { current: gizmo } = gizmoRef;
    if (!button || !controls || !gizmo)
      return; 

    const onControlsDraggingUpdate = (e) => {
      const dragging = e.value;
      if (dragging)
        return;
      onFloorChange({
        ...floor,
        position: { x: gizmo.position.x, y: gizmo.position.y, z: gizmo.position.z },
        quaternion: gizmo.quaternion,
        size: { x: gizmo.scale.x, y: gizmo.scale.y, z: gizmo.scale.z },
      })
    };
    const onChange = () => {
      onFloorChange({
        ...floor,
        position: { x: gizmo.position.x, y: gizmo.position.y, z: gizmo.position.z },
        quaternion: gizmo.quaternion,
        size: { x: gizmo.scale.x, y: gizmo.scale.y, z: gizmo.scale.z },
      })
    }
    const onButtonClick = () => {
      const modes/*: ('translate' | 'rotate' | 'scale')[]*/ = [
        'translate',
        'rotate',
        'scale',
      ]
      const currentModeIndex = modes.indexOf(controls.mode);
      const nextModeIndex = (currentModeIndex + 1) % 3;
      const nextMode = modes[nextModeIndex];
      controls.setMode(nextMode);
    };
    button.addEventListener('click', onButtonClick);
    controls.addEventListener('dragging-changed', onControlsDraggingUpdate);
    controls.addEventListener('change', onChange);

    return () => {
      controls.removeEventListener('dragging-changed', onControlsDraggingUpdate);
      controls.removeEventListener('change', onChange);
      button.removeEventListener('click', onButtonClick);
    }
  }, [controls, floor, onFloorChange]);

  const linesGeometry = useDisposable(() => {
    const box = new BoxGeometry(1, 1, 1);
    const lines = new EdgesGeometry(box);
    return lines;
  }, [floor])

  const floorAABB = useMemo(() => {
    const matrix = new Matrix4()
      .compose(
        miniVectorToThreeVector(floor.position),
        miniQuaternionToThreeQuaternion(floor.rotation),
        miniVectorToThreeVector(floor.size));

    const floorBoundingBox = new Box3(
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(0.5, 0.5, 0.5)
    )
      .applyMatrix4(matrix);
      
    return floorBoundingBox;
  }, [floor])

  useChildObject(ref, () => {
    return new Box3Helper(floorAABB);
  }, [floorAABB])
  useChildObject(ref, () => {
    const a = new AxesHelper(0);
    vectorSetMini(a.position, floor.position);
    return a;
  }, [floor])


  return [
    h(group, { ref }, [
      h(lineSegments, {
        ref: gizmoRef,
        position: miniVectorToThreeVector(floor.position),
        quaternion: miniQuaternionToThreeQuaternion(floor.rotation),
        scale: miniVectorToThreeVector(floor.size),
        geometry: linesGeometry,
      }, [
        h(css2dObject, { position: new Vector3(0, 1, 0) }, [
          h('button', { ref: buttonRef }, 'Toggle Gizmo')
        ]),
      ]),
    ]),
  ]
};