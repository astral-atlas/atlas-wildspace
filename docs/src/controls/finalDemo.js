// @flow strict
/*:: import type { Camera, PerspectiveCamera } from "three"; */
/*:: import type { Ref, Component } from "@lukekaalim/act"; */
/*:: import type { Frame } from "@lukekaalim/act-curve"; */
import { h } from "@lukekaalim/act/element";
import { useEffect, useRef, useState } from "@lukekaalim/act/hooks";

import styles from './index.module.css';
import {
  calculateKeyVelocity,
  useKeyboardContextValue,
  useKeyboardEvents,
  useKeyboardState,
  useKeyboardTrack,
} from "./keyboard";
import {
  calculateCubicBezierAnimationPoint,
  createInitialCubicBezierAnimation,
  interpolateCubicBezierAnimation,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";
import { useAnimation } from "@lukekaalim/act-curve/animation";
import { getVectorForKeys } from "./axis";
import { simulateParticle2D } from "./momentum";
import { rotateVector, setFocusTransform } from "./camera";
import { scene } from "@lukekaalim/act-three/components";
import { ControlCanvas } from "./canvas";

/*::
type CameraControlInput = {
  rotation: number,
  position: [number, number],
};
*/

const getRotationFromKeys = (velocity) => {
  const leftRotation = velocity.get('KeyQ') === 1 ? -1 : 0;
  const rightRotation = velocity.get('KeyE') === 1 ? 1 : 0;
  return leftRotation + rightRotation;
};

export const useBoardCameraControl = (
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  readInputs/*: () => Frame<Set<string>>[]*/,
) => {
  const cameraStateRef = useRef({
    rotationAnimation: createInitialCubicBezierAnimation(1/8),
    positionParticle: { position: [0, 0], velocityPerMs: [0, 0] }
  });
  useAnimation((now) => {
    const state = cameraStateRef.current;
    const inputs = readInputs();
    for (let i = 1; i < inputs.length; i++) {
      const prevInput = inputs[i - 1];
      const nextInput = inputs[i];

      const delta = nextInput.time - prevInput.time;
      const acceleration = getVectorForKeys([...prevInput.value], 0.003);
      const { position: currentRotation } = calculateCubicBezierAnimationPoint(
        state.rotationAnimation,
        nextInput.time
      );
      state.positionParticle = simulateParticle2D(
        state.positionParticle,
        { velocityMagnitudeMax: 0.1, dragCoefficent: 0.005 },
        rotateVector(acceleration, currentRotation),
        delta,
      )

      const velocity = calculateKeyVelocity(prevInput.value, nextInput.value);
      const rotationVelocity = getRotationFromKeys(velocity) / 8;
      if (rotationVelocity !== 0) {
        state.rotationAnimation = interpolateCubicBezierAnimation(
          state.rotationAnimation,
          state.rotationAnimation.shape[3] + rotationVelocity,
          600,
          3/8,
          nextInput.time
        );
      }
    }

    const { current: camera } = cameraRef;
    if (!camera)
      return;
    const { position: rotation } = calculateCubicBezierAnimationPoint(
      state.rotationAnimation,
      now,
    );
    const position = state.positionParticle.position;
    setFocusTransform(
      [position[0], 0, position[1]],
      [40, 40, 0],
      rotation,
      camera
    );
  }, []);
};


export const FinalDemo/*: Component<>*/ = () => {
  const cameraRef = useRef();
  const sceneRef = useRef();
  const canvasRef = useRef();

  const [readInputs, onInputChange] = useKeyboardTrack()
  const [keyRef, events] = useKeyboardState(null, onInputChange);
  const keyboardContext = useKeyboardContextValue(canvasRef);
  useEffect(() => {
    const clearDown = keyboardContext.subscribeDown(events.down);
    const clearUp = keyboardContext.subscribeUp(events.up);
    return () => (clearDown(), clearUp());
  }, [])

  useBoardCameraControl(cameraRef, readInputs);

  return [
    h('canvas', { ref: canvasRef, tabIndex: 0, class: styles.demoCanvas }),
    h(ControlCanvas, { sceneRef, cameraRef, canvasRef }),
  ]
}