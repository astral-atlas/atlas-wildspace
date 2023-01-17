// @flow strict

import { h, useContext, useEffect, useState } from "@lukekaalim/act"
import { perspectiveCamera } from "@lukekaalim/act-three"
import { renderCanvasContext } from "../three";
import {
  createFreeCameraController,
  subscribeFreeCameraUpdates,
  useFreeCameraController,
} from "./useFreeCameraController";
import { Vector3, Quaternion } from "three";


/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { PerspectiveCamera } from "three";
import type { KeyboardTrack } from "../keyboard/track";

export type FreeCameraProps = {
  onFreeCameraUpdate?: (camera: PerspectiveCamera) => void,
  onFreeCameraChange?: (camera: PerspectiveCamera) => void,
  surfaceRef?: ?Ref<?HTMLElement>,
  keys?: ?KeyboardTrack,
  position?: Vector3,
  quaternion?: Quaternion,
};
*/
export const FreeCamera/*: Component<FreeCameraProps>*/ = ({
  onFreeCameraUpdate,
  onFreeCameraChange,
  surfaceRef,
  keys,
  position = new Vector3(),
  quaternion = new Quaternion().identity(),
}) => {
  const render = useContext(renderCanvasContext);

  if (!render)
    return null;

  const [controller, setController] = useState(null)
  useEffect(() => {
    const { current: surface } = surfaceRef || render.canvasRef;
    const { current: camera } = render.cameraRef;
    if (!surface || !camera)
      return;
    const controller = createFreeCameraController(position, quaternion);
    setController(controller)
    const unsubscribeCameraUpdate = render.loop.subscribeSimulate(() => {
      const controllerChanged = (
        !camera.position.equals(controller.position) ||
        !camera.quaternion.equals(controller.rotation)
      );
      if (!controllerChanged)
        return;

      camera.position.copy(controller.position);
      camera.quaternion.copy(controller.rotation);
      onFreeCameraUpdate && onFreeCameraUpdate(camera);
    })
    return () => {
      unsubscribeCameraUpdate();
    }
  }, [surfaceRef])

  useEffect(() => {
    const { current: surface } = surfaceRef || render.canvasRef;
    const { current: camera } = render.cameraRef;
    if (!surface || !camera || !controller)
      return;
    
    const updates = subscribeFreeCameraUpdates(
      controller,
      surface,
      render.loop,
      keys || render.keyboard,
      (focus) => {
        if (!focus)
          onFreeCameraChange && onFreeCameraChange(camera)
      }
    );

    return () => {
      updates.unsubscribe();
    }
  }, [keys, onFreeCameraChange, controller])

  return h(perspectiveCamera, { ref: render.cameraRef })
}