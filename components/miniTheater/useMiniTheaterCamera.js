// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { Box2, PerspectiveCamera } from "three";

import type { KeyboardTrack } from "../keyboard";
import type { LoopController } from "../three";
*/
import { Vector2, Vector3 } from "three";

import { useEffect, useState } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve";

import { useParticle2dSimulation } from "../particle";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";
import { setFocusTransform2 } from "../utils/vector";

export const useMiniTheaterCamera = (
  keyboard/*: KeyboardTrack*/,
  canvasRef/*: Ref<?HTMLCanvasElement>*/,
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  loop/*: LoopController*/,
  cameraBounds/*: ?Box2*/,
) => {
  const [cameraParticle, simulate] = useParticle2dSimulation(
    cameraBounds,
    0.005,
    0.05,
    cameraBounds && cameraBounds.getCenter(new Vector2(0, 0))
  );
  const [rotation, setRotation] = useState/*:: <number>*/(0.125);
  const [rotationAnim] = useAnimatedNumber(rotation, rotation, { duration: 400, impulse: (0.125 * 3) });

  const [zoom, setZoom] = useState/*:: <number>*/(32);
  const [zoomAnim] = useAnimatedNumber(zoom, zoom, { duration: 400, impulse: 3 });

  useEffect(() => {
    const { current: camera } = cameraRef;
    const { current: canvas } = canvasRef;
    if (!camera || !canvas)
      return;

    const onWheel = (event/*: WheelEvent*/) => {
      if (document.activeElement !== canvas)
        return;
      event.preventDefault();
      setZoom(z => Math.min(1000, Math.max(10, z + (event.deltaY / 10))));
    }
    const onSimulate = (c, v) => {
      const keys = keyboard.readDiff();
      const keysVelocity = calculateKeyVelocity(keys.prev.value, keys.next.value);
      if (keysVelocity.get('KeyQ') === -1)
        setRotation(r => r - 0.125)
      if (keysVelocity.get('KeyE') === -1)
        setRotation(r => r + 0.125)
  
      const rotationPoint = calculateCubicBezierAnimationPoint(rotationAnim, v.now);
      const zoomPoint = calculateCubicBezierAnimationPoint(zoomAnim, v.now);

      const rotationRadians = rotationPoint.position * 2 * Math.PI;
      const acceleration = getVector2ForKeyboardState(keys.next.value)
        .multiplyScalar(0.0015)
        .rotateAround(new Vector2(0, 0), rotationRadians);
  
      simulate(acceleration, v.delta);
  
      setFocusTransform2(
        new Vector3(cameraParticle.position.x, 0, -cameraParticle.position.y),
        0.25 + rotationPoint.position,
        new Vector2(-zoomPoint.position, zoomPoint.position),
        camera,
      );
    }

    canvas.addEventListener('wheel', onWheel);
    const unsubscribeSim = loop.subscribeSimulate(onSimulate);

    return () => {
      unsubscribeSim();
      canvas.removeEventListener('wheel', onWheel);
    }
  }, [rotationAnim, zoomAnim])
};