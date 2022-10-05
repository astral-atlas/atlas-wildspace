// @flow strict

import { useEffect, useRef, useState } from "@lukekaalim/act";
import { createMiniTheaterCameraController } from "./useMiniTheaterCamera";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";
import { calculateCubicBezierAnimationPoint, calculateSpanProgress, useAnimatedNumber } from "@lukekaalim/act-curve";
import { createInitialBasicTransformAnimation, getBasicTransformationPoint, useAnimatedVector3 } from "../animation";
import { Quaternion, Vector3 } from "three";
import { interpolateBasicTransformAnimation } from "../animation/transform";
import { createFreeCameraController } from "./useFreeCameraController";

/*::
import type {
  MiniQuaternion,
  MiniVector,
} from "@astral-atlas/wildspace-models";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { LoopController } from "../three/useLoopController";
import type { KeyboardTrack } from "../keyboard/track";
import type { Ref } from "@lukekaalim/act/hooks";
import type { PerspectiveCamera } from "three";
import type { TimeSpan } from "@lukekaalim/act-curve";
import type {
  BasicTransform,
  BasicTransformAnimation,
} from "../animation/transform";
import type { MiniTheaterController2 } from "./useMiniTheaterController2";

export type MiniTheaterMode =
  | { type: 'full-control', controller: MiniTheaterController2, keys: KeyboardTrack }
  | { type: 'stalled-control', controller: MiniTheaterController2 }
  | { type: 'free-cam', keys: KeyboardTrack }
  | { type: 'fixed', transform: BasicTransform }
*/

export const useMiniTheaterMode = (
  mode/*: MiniTheaterMode*/,
  loop/*: LoopController*/,
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  surfaceRef/*: Ref<?HTMLElement>*/,
  deps/*: mixed[]*/ = []
) => {
  const miniTheaterCameraRef = useRef(createMiniTheaterCameraController());
  const freeCamRef = useRef(createFreeCameraController());
  const [modeAnim] = useAnimatedNumber(mode.type === 'fixed' ? 1 : 0, null, { duration: 1000, impulse: 0 });
  const [fixedAnim, setFixedAnim] = useState/*:: <?BasicTransformAnimation>*/(null);

  useEffect(() => {
    if (mode.type !== 'fixed')
      return;
    
    setFixedAnim((prevAnim) => {
      if (!prevAnim)
        return createInitialBasicTransformAnimation(mode.transform);
      return interpolateBasicTransformAnimation(prevAnim, mode.transform, performance.now(), 1000);
    });
  }, [mode])

  useEffect(() => {
    const { current: cameraController } = miniTheaterCameraRef;
    const { current: freeCamController } = freeCamRef;
    const { current: camera } = cameraRef;
    const { current: surface } = surfaceRef;

    if (!camera || !surface)
      return;
    
    const stopSimulation = loop.subscribeSimulate((c, v) => {
      if (mode.type === 'free-cam') {
        freeCamController.update();
        const { rotation, position } = freeCamController.getControllerTransform();
        camera.position.copy(position);
        camera.quaternion.copy(rotation);
        return;
      }
      const modePoint = calculateCubicBezierAnimationPoint(modeAnim, v.now);
      cameraController.simulateCamera(v.delta);

      const controllerTransform = cameraController.getControllerTransform(v.now);
      const fixedTransform = fixedAnim ?
        getBasicTransformationPoint(fixedAnim, v.now) :
        { position: new Vector3(0, 0, 0), rotation: new Quaternion() };

      camera.position.lerpVectors(controllerTransform.position, fixedTransform.position, modePoint.position);
      camera.quaternion.slerpQuaternions(controllerTransform.rotation, fixedTransform.rotation, modePoint.position);
    });

    if (mode.type === "full-control") {
      const onWheel = (event/*: WheelEvent*/) => {
        event.preventDefault();
        cameraController.moveZoom(event.deltaY / 10);
      }

      const stopInput = loop.subscribeInput((c, v) => {
        const keysDiff = mode.keys.readDiff();
        const keysVelocity = calculateKeyVelocity(keysDiff.prev.value, keysDiff.next.value);
        if (keysVelocity.get('KeyQ') === -1)
          cameraController.rotate(v.now, -0.125)
        if (keysVelocity.get('KeyE') === -1)
          cameraController.rotate(v.now, +0.125)

        const acceleration = getVector2ForKeyboardState(keysDiff.next.value);
        cameraController.setAcceleration(v.now, acceleration);
      });
      surface.addEventListener('wheel', onWheel);
      return () => {
        surface.removeEventListener('wheel', onWheel);
        stopSimulation();
        stopInput();
      }
    }
    if (mode.type === 'free-cam') {
      const onClick = (event/*: MouseEvent*/) => {
        if (document.pointerLockElement === surface)
          document.exitPointerLock();
        else
          surface.requestPointerLock();
      };
      const onMouseMove = (event/*: MouseEvent*/) => {
        if (document.pointerLockElement === surface)
          freeCamController.moveCursor(event.movementX, event.movementY);
      }
      const stopInput = loop.subscribeInput((c, v) => {
        const keysDiff = mode.keys.readDiff();
        const velocity = getVector2ForKeyboardState(keysDiff.next.value);
        freeCamController.setVelocity(new Vector3(velocity.x, 0, velocity.y));
      });
      surface.addEventListener('click', onClick);
      surface.addEventListener('mousemove', onMouseMove);
      return () => {
        surface.removeEventListener('click', onClick);
        surface.removeEventListener('mousemove', onMouseMove);
        stopSimulation();
        stopInput();
      }
    }
    return () => {
      stopSimulation();
    }
  }, [mode, modeAnim, fixedAnim, ...deps])
};