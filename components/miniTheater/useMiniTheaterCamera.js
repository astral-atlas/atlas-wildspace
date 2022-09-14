// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { Box2, Matrix4, PerspectiveCamera, Quaternion } from "three";

import type { KeyboardTrack } from "../keyboard";
import type { LoopController } from "../three";
import type {
  RenderLoopConstants,
  RenderLoopVariables,
} from "../three/useLoopController";
import type { KeyboardDiff } from "../keyboard/track";
import type { BasicTransform } from "../animation/transform";
import type { MiniTheaterController } from "./useMiniTheaterController";
*/
import { Vector2, Vector3 } from "three";

import { useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, createInitialCubicBezierAnimation, interpolateCubicBezierAnimation, useAnimatedNumber } from "@lukekaalim/act-curve";

import { useParticle2dSimulation } from "../particle";
import { calculateKeyVelocity, getVector2ForKeyboardState } from "../keyboard";
import { lookAt, setFocusTransform2 } from "../utils/vector";
import { simulateParticle2D } from "../particle/particle2d";
import { useMiniTheaterMode } from "./useMiniTheaterMode";

/*::
export type MiniTheaterCameraController = {
  rotate(now: number, direction: number): void,
  setAcceleration(now: number, directionalAcceleration: Vector2): void,
  moveZoom(distanceDelta: number): void,
  simulateCamera(timeDeltaMs: number): void,

  getControllerTransform(now: number): BasicTransform
};
*/
const up = new Vector3(0, 1, 0);

export const createMiniTheaterCameraController = (
  initialPosition/*: Vector2*/ = new Vector2(0, 0),
  initialVelocity/*: Vector2*/ = new Vector2(0, 0),
  initialRotation/*: number*/ = 0.125,
  initialZoom/*: number*/ = 32 ,
  cameraBounds/*: ?Box2*/ = null,
)/*: MiniTheaterCameraController*/ => {
  const settings = {
    bounds: cameraBounds,
    dragCoefficent: 0.005,
    velocityMagnitudeMax: 0.05,
  };
  let cameraParticle = {
    position: initialPosition,
    velocityPerMs: initialVelocity
  };
  let rotationTarget = initialRotation;
  let rotationAnim = createInitialCubicBezierAnimation(initialRotation);
  let zoom = initialZoom;
  let acceleration = new Vector2(0, 0);

  const rotate = (now, rotationDelta) => {
    rotationTarget += rotationDelta;
    rotationAnim = interpolateCubicBezierAnimation(rotationAnim, rotationTarget, 400, (0.125 * 3), now);
  }
  const moveZoom = (distanceDelta) => {
    zoom = Math.min(1000, Math.max(10, zoom + distanceDelta));
  }
  const setAcceleration = (now, directionalAcceleration) => {
    const rotationPoint = calculateCubicBezierAnimationPoint(rotationAnim, now);

    const rotationRadians = rotationPoint.position * 2 * Math.PI;
    acceleration.copy(directionalAcceleration)
      .multiplyScalar(0.0015)
      .rotateAround(new Vector2(0, 0), rotationRadians);
  }

  const simulateCamera = (timeDeltaMs) => {
    simulateParticle2D(cameraParticle, settings, acceleration, timeDeltaMs);
    acceleration.set(0, 0);
  };

  const getControllerTransform = (now) => {
    const rotationPoint = calculateCubicBezierAnimationPoint(rotationAnim, now);
    const target = new Vector3(cameraParticle.position.x, 0, -cameraParticle.position.y);
    const cameraRotation = 0.25 + rotationPoint.position;
    const offset = new Vector2(-zoom, zoom);

    const position = new Vector3(offset.x, offset.y, 0)
      .applyAxisAngle(up, cameraRotation * Math.PI * 2)
      .add(target);
    const rotation = lookAt(position, target, up);

    return {
      position,
      rotation,
    }
  }

  return {
    rotate,
    moveZoom,
    setAcceleration,
    simulateCamera,
    getControllerTransform,
  }
}

export const useMiniTheaterCamera = (
  keys/*: KeyboardTrack*/,
  surface/*: Ref<?HTMLElement>*/,
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  loop/*: LoopController*/,
  controller/*: MiniTheaterController*/
) => {
  const mode = useMemo(() => ({
    type: 'full-control',
    keys,
    controller
  }), [keys, controller])

  useMiniTheaterMode(mode, loop, cameraRef, surface, []);
};