// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { Box2, PerspectiveCamera } from "three";

import type { KeyboardTrack } from "../keyboard";
import type { LoopController } from "../three";
*/
import { Vector2, Vector3 } from "three";

import { useEffect, useRef, useState } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve";

import { useParticle2dSimulation } from "../particle";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";
import { setFocusTransform2 } from "../utils/vector";

export const useMiniTheaterCamera = (
  keyboard/*: KeyboardTrack*/,
  controlSurfaceElementRef/*: Ref<?HTMLElement>*/,
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

  const zoomRef = useRef(32);
  const [zoom, setZoom] = useState/*:: <number>*/(32);
  const [] = useAnimatedNumber(zoom, zoom, { duration: 400, impulse: 3 });

  useEffect(() => {
    const { current: camera } = cameraRef;
    const { current: controlSurfaceElement } = controlSurfaceElementRef;
    if (!camera || !controlSurfaceElement)
      return;

    const onWheel = (event/*: WheelEvent*/) => {
      if ((!controlSurfaceElement.contains(document.activeElement) && controlSurfaceElement !== document.activeElement))
        return;
      event.preventDefault();
      zoomRef.current = Math.min(1000, Math.max(10, zoomRef.current + (event.deltaY / 10)));
    }
    const onSimulate = (c, v) => {
      const keys = keyboard.readDiff();
      const keysVelocity = calculateKeyVelocity(keys.prev.value, keys.next.value);
      if (keysVelocity.get('KeyQ') === -1)
        setRotation(r => r - 0.125)
      if (keysVelocity.get('KeyE') === -1)
        setRotation(r => r + 0.125)
  
      const rotationPoint = calculateCubicBezierAnimationPoint(rotationAnim, v.now);

      const rotationRadians = rotationPoint.position * 2 * Math.PI;
      const acceleration = getVector2ForKeyboardState(keys.next.value)
        .multiplyScalar(0.0015)
        .rotateAround(new Vector2(0, 0), rotationRadians);
  
      simulate(acceleration, v.delta);
  
      setFocusTransform2(
        new Vector3(cameraParticle.position.x, 0, -cameraParticle.position.y),
        0.25 + rotationPoint.position,
        new Vector2(-zoomRef.current, zoomRef.current),
        camera,
      );
    }

    controlSurfaceElement.addEventListener('wheel', onWheel);
    const unsubscribeSim = loop.subscribeSimulate(onSimulate);

    return () => {
      unsubscribeSim();
      controlSurfaceElement.removeEventListener('wheel', onWheel);
    }
  }, [rotationAnim])
};