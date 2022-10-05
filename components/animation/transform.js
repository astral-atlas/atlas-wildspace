// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { calculateSpanProgress } from "@lukekaalim/act-curve";
import { Vector3, Quaternion } from "three";

/*::
import type { TimeSpan } from "@lukekaalim/act-curve/schedule";

export type BasicTransform = {
  position: Vector3,
  rotation: Quaternion,
};

export type BasicTransformAnimation = {
  type: 'basic-transform',
  span: TimeSpan,
  shape: [BasicTransform, BasicTransform]
};
*/

export const createInitialBasicTransformAnimation = (
  initialTransform/*: BasicTransform*/ = { position: new Vector3(0, 0, 0), rotation: new Quaternion() },
)/*: BasicTransformAnimation*/ => ({
  type: 'basic-transform',
  span: { start: 0, durationMs: 0 },
  shape: [initialTransform, initialTransform]
});

export const getBasicTransformationPoint = (
  anim/*: BasicTransformAnimation*/,
  now/*: number*/
)/*: BasicTransform*/ => {
  const progress = calculateSpanProgress(anim.span, now);
  const position = new Vector3(0, 0, 0)
    .lerpVectors(anim.shape[0].position, anim.shape[1].position, progress);
  const rotation = new Quaternion()
    .slerpQuaternions(anim.shape[0].rotation, anim.shape[1].rotation, progress);
    return { position, rotation };
}

export const interpolateBasicTransformAnimation = (
  anim/*: BasicTransformAnimation*/, 
  next/*: BasicTransform*/,
  start/*: number*/,
  durationMs/*: number*/
)/*: BasicTransformAnimation*/ => {
  const prev = getBasicTransformationPoint(anim, start);

  return {
    type: 'basic-transform',
    span: { start, durationMs },
    shape: [prev, next],
  };
}
