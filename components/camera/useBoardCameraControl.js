// @flow strict
/*::
import type { BoxBoardArea } from "@astral-atlas/wildspace-models";
import type { Ref } from '@lukekaalim/act';
import type { Frame } from "@lukekaalim/act-curve";
import type { PerspectiveCamera } from "three";
*/

import { useRef } from "@lukekaalim/act";
import {
  useAnimation,
  useAnimatedNumber,
  createInitialCubicBezierAnimation,
  calculateCubicBezierAnimationPoint,
  interpolateCubicBezierAnimation,
} from "@lukekaalim/act-curve";
import { calculateKeyVelocity, getVectorForKeys } from "../keyboard";
import { rotateVector, setFocusTransform } from "../utils/vector";
import { simulateParticle2D } from "../particle";
import { Vector2 } from "three";
import { clampParticlePosition } from "../particle/particle2d";


const getRotationFromKeys = (velocity) => {
  const leftRotation = velocity.get('KeyQ') === 1 ? -1 : 0;
  const rightRotation = velocity.get('KeyE') === 1 ? 1 : 0;
  return leftRotation + rightRotation;
};

export const useBoardCameraControl = (
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  readInputs/*: () => Frame<Set<string>>[]*/,
  height/*: number*/ = 40,
  initialPosition/*: Vector2*/ = new Vector2(0, 0),
  maxPosition/*: BoxBoardArea*/,
) => {
  const cameraStateRef = useRef({
    rotationAnimation: createInitialCubicBezierAnimation(1/8),
    positionParticle: { position: initialPosition, velocityPerMs: new Vector2(0, 0) }
  });
  const [heightAnim] = useAnimatedNumber(height, height);
  useAnimation((now) => {
    const state = cameraStateRef.current;
    const inputs = readInputs();
    for (let i = 1; i < inputs.length; i++) {
      const prevInput = inputs[i - 1];
      const nextInput = inputs[i];

      const delta = nextInput.time - prevInput.time;
      const acceleration = getVectorForKeys([...prevInput.value], 0.0015);
      const { position: currentRotation } = calculateCubicBezierAnimationPoint(
        state.rotationAnimation,
        nextInput.time
      );
      simulateParticle2D(
        state.positionParticle,
        { velocityMagnitudeMax: 0.05, dragCoefficent: 0.005 },
        new Vector2(-acceleration[0], acceleration[1])
          .rotateAround(new Vector2(0, 0), (currentRotation - 0.25) * Math.PI * 2),
        delta,
      )
      clampParticlePosition(
        state.positionParticle,
        new Vector2(
          maxPosition.position.x * 10,
          maxPosition.position.y * 10
        ),
        new Vector2(
          (maxPosition.position.x + maxPosition.size.x) * 10,
          (maxPosition.position.y + maxPosition.size.y) * 10
        )
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
    const heightPoint = calculateCubicBezierAnimationPoint(heightAnim, now);

    const { current: camera } = cameraRef;
    if (!camera)
      return;
    const { position: rotation } = calculateCubicBezierAnimationPoint(
      state.rotationAnimation,
      now,
    );
    const position = state.positionParticle.position;
    setFocusTransform(
      [position.x, 0, position.y],
      [50, heightPoint.position, 0],
      rotation,
      camera
    );
  }, []);
};
