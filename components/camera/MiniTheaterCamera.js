// @flow strict

import { h, useContext, useEffect } from "@lukekaalim/act"
import { perspectiveCamera } from "@lukekaalim/act-three"
import { renderCanvasContext } from "../three";
import { createMiniTheaterCameraController } from "../miniTheater/useMiniTheaterCamera";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";


/*::
import type { Component } from "@lukekaalim/act";
export type MiniTheaterCameraProps = {

}
*/

export const MiniTheaterCamera/*: Component<MiniTheaterCameraProps>*/ = ({

}) => {
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;

  useEffect(() => {
    const { cameraRef, loop, keyboard, canvasRef } = render;
    const { current: camera } = cameraRef;
    const { current: canvas } = canvasRef;
    if (!camera || !canvas)
      return;
    const controller = createMiniTheaterCameraController();
    const stopInput = loop.subscribeInput((c, v) => {
      const { prev, next } = keyboard.readDiff();
      const acceleration = getVector2ForKeyboardState(next.value);
      const kv = calculateKeyVelocity(prev.value, next.value)
      if (kv.get('KeyQ') === 1)
        controller.rotate(v.now, -1/8);
      if (kv.get('KeyE') === 1)
        controller.rotate(v.now, 1/8);
      controller.setAcceleration(v.now, acceleration);
    });
    const stopSim = loop.subscribeSimulate((c, v) => {
      controller.simulateCamera(v.delta);
      const t = controller.getControllerTransform(v.now)
      camera.position.copy(t.position);
      camera.quaternion.copy(t.rotation);
    });
    const onMouseWheel = (event/*: WheelEvent*/) => {
      event.preventDefault();
      controller.moveZoom(event.deltaY)
    };
    canvas.addEventListener('wheel', onMouseWheel)

    return () => {
      stopInput();
      stopSim();
      canvas.removeEventListener('wheel', onMouseWheel)
    }
  }, [render])

  return h(perspectiveCamera, { ref: render.cameraRef })
}