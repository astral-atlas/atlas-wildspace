// @flow strict

import { h, useContext, useEffect } from "@lukekaalim/act"
import { perspectiveCamera } from "@lukekaalim/act-three"
import { renderCanvasContext } from "../three";
import {
  createFreeCameraController,
  subscribeFreeCameraUpdates,
  useFreeCameraController,
} from "./useFreeCameraController";

/*::
import type { Component } from "@lukekaalim/act";
import type { PerspectiveCamera, Quaternion, Vector3 } from "three";

export type FreeCameraProps = {
  onFreeCameraUpdate?: (camera: PerspectiveCamera) => void,
  onFreeCameraChange?: (camera: PerspectiveCamera) => void,
  position: Vector3,
  quaternion: Quaternion,
};
*/
export const FreeCamera/*: Component<FreeCameraProps>*/ = ({
  onFreeCameraUpdate = _ => {},
  onFreeCameraChange = _ => {},
  position,
  quaternion,
}) => {
  const render = useContext(renderCanvasContext);

  if (!render)
    return null;

  useEffect(() => {
    const { current: canvas } = render.canvasRef;
    const { current: camera } = render.cameraRef;
    if (!canvas || !camera)
      return;
    const controller = createFreeCameraController(position, quaternion);
    const updates = subscribeFreeCameraUpdates(controller, canvas, render.loop, render.keyboard, () => {
      onFreeCameraChange(camera)
    });
    const unsubscribeCameraUpdate = render.loop.subscribeSimulate(() => {
      const controllerChanged = (
        !camera.position.equals(controller.position) ||
        !camera.quaternion.equals(controller.rotation)
      );
      if (!controllerChanged)
        return;

      camera.position.copy(controller.position);
      camera.quaternion.copy(controller.rotation);
      onFreeCameraUpdate(camera);
    })
    return () => {
      updates.unsubscribe();
      unsubscribeCameraUpdate();
    }
  }, [onFreeCameraUpdate, onFreeCameraChange, position, quaternion])

  return h(perspectiveCamera, { ref: render.cameraRef, position, quaternion })
}