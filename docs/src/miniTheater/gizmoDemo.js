// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { AxisGizmo, FreeCamera, RenderCanvas, useElementKeyboard, useKeyboardTrack, useLoopController, useRaycastElement, useRaycastLoop, useRaycastManager, useTransformControls } from "@astral-atlas/wildspace-components";
import { h, useRef, useState } from "@lukekaalim/act";
import { GridHelperGroup } from "../controls/helpers";
import { BoxGeometry, Vector2, Vector3 } from "three";
import { ScaledLayoutDemo } from "../demo";
import { mesh } from "@lukekaalim/act-three";

const geometry = new BoxGeometry(10, 10, 10);

const TestCube = () => {
  const ref = useRef();
  useTransformControls(ref);
  return h(mesh, { ref, geometry });
}

export const GizmoDemo/*: Component<>*/ = () => {
  const buttonRef = useRef();
  const emitter = useElementKeyboard(buttonRef);
  const keys = useKeyboardTrack(emitter);

  const raycast = useRaycastManager();
  const cameraRef = useRef();
  const canvasRef = useRef();
  const loop = useLoopController();
  useRaycastElement(raycast, canvasRef);
  useRaycastLoop(raycast, loop)

  const [position, setPosition] = useState(new Vector3(0, 0, 0))
  const onAxisMove = (delta) => {
    setPosition(new Vector3(position.x + delta.x, position.y, position.z + delta.y))
  }

  return [
    h('button', { ref: buttonRef }, 'Fly Camera'),
    h(RenderCanvas, { renderSetupOverrides: { canvasRef, cameraRef, loop }}, [
      h(GridHelperGroup),
      h(TestCube),
      h(FreeCamera, { surfaceRef: buttonRef, keys }),
    ])
  ];
}