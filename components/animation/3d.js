// @flow strict
/*::
import type { TimeSpan } from "@lukekaalim/act-curve";
*/

import { useMemo, useRef } from "@lukekaalim/act";

import {
  calculateSpanProgress,
  getBezierVelocity,
  calculateBezierFromVelocity,
} from "@lukekaalim/act-curve";

import { Vector3, CubicBezierCurve3 } from "three";

/*::
export type Vector3BezierAnimation = {
  shape: CubicBezierCurve3,
  span: TimeSpan,
};
export type Vector3BezierAnimationPoint = {
  progress: number,
  position: Vector3,
  velocity: Vector3,
};
*/

export const calculateVector3BezierAnimationPoint = (anim/*: Vector3BezierAnimation*/, now/*: DOMHighResTimeStamp*/)/*: Vector3BezierAnimationPoint*/ => {
  const progress = calculateSpanProgress(anim.span, now);
  const position = anim.shape.getPoint(progress, new Vector3(0, 0, 0))
  const velocity = getCubicBezierCurve3Velocity(anim.shape, progress);
  return {
    progress,
    position,
    velocity
  }
}

const getCubicBezierCurve3Velocity = (shape, progress) => {
  return new Vector3(
    getBezierVelocity([shape.v0.x, shape.v1.x, shape.v2.x, shape.v3.x], progress),
    getBezierVelocity([shape.v0.y, shape.v1.y, shape.v2.y, shape.v3.y], progress),
    getBezierVelocity([shape.v0.z, shape.v1.z, shape.v2.z, shape.v3.z], progress),
  )
}

export const interpolateVector3Bezier = (
  bezier/*: Vector3BezierAnimation*/,
  target/*: Vector3*/,
  durationMs/*: number*/,
  impulse/*: number*/,
  start/*: number*/,
)/*: Vector3BezierAnimation*/ => {
  const progress = calculateSpanProgress(bezier.span, start);

  const currentPosition = bezier.shape.getPoint(progress);
  const currentVelocityMs = getCubicBezierCurve3Velocity(bezier.shape, progress)
    .multiplyScalar(bezier.span.durationMs === 0 ? 0 : (1/bezier.span.durationMs));

  const direction = target.clone()
    .sub(currentPosition)
    .normalize()

  const nextVelocity = direction.clone()
    .multiplyScalar(impulse)
    .add((currentVelocityMs.multiplyScalar(durationMs)));

  const x = calculateBezierFromVelocity(currentPosition.x, nextVelocity.x, 0, target.x);
  const y = calculateBezierFromVelocity(currentPosition.y, nextVelocity.y, 0, target.y);
  const z = calculateBezierFromVelocity(currentPosition.z, nextVelocity.z, 0, target.z);
  const shape = new CubicBezierCurve3(
    new Vector3(x[0], y[0], z[0]),
    new Vector3(x[1], y[1], z[1]),
    new Vector3(x[2], y[2], z[2]),
    new Vector3(x[3], y[3], z[3]),
  )
  
  const span = { start, durationMs };
  return { shape, span };
}

export const useAnimatedVector3 = (
  target/*: Vector3*/,
  initial/*: Vector3*/ = target,
  duration/*: number*/ = 500,
  impulse/*: number*/ = 1
)/*: [Vector3BezierAnimation]*/ => {
  const initialAnimation = useMemo(() => {
    return interpolateVector3Bezier(
      { shape: new CubicBezierCurve3(initial, initial, initial, initial), span: { start: 0, durationMs: 10 } },
      target,
      duration,
      impulse,
      performance.now()
    );
  }, [])

  const prevValueRef = useRef(initial);
  const animRef = useRef(initialAnimation);

  if (!prevValueRef.current.equals(target)) {
    animRef.current = interpolateVector3Bezier(animRef.current, target, duration, impulse, performance.now());
    prevValueRef.current = target;
  }

  return [animRef.current];
}