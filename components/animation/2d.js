// @flow strict
/*::
import type { Component, ElementNode } from '@lukekaalim/act';
import type { CubicBezierAnimation, TimeSpan } from '@lukekaalim/act-curve';
*/
import { useMemo} from '@lukekaalim/act';
import { useTimeSpan, maxSpan } from '@lukekaalim/act-curve';
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";


/*::
export type GridMenuProps = {
  rows: ElementNode[][],
  position: [number, number],
};

export type CubicBezier2DAnimation = {
  type: 'cubic-bezier-2d',
  x: CubicBezierAnimation,
  y: CubicBezierAnimation,
  max: TimeSpan,
};
export type CubicBezier2DPoint = {
  progress: [number, number],
  position: [number, number],
  velocity: [number, number],
  acceleration: [number, number],
};
*/

export const useAnimatedVector2 = (
  vector/*: [number, number]*/,
  initial/*: ?[number, number]*/ = [0, 0],
  impulse/*: number*/ = 0,
  duration/*: number*/ = 1000,
)/*: CubicBezier2DAnimation*/ => {
  const [x] = useAnimatedNumber(vector[0], initial[0], { duration, impulse });
  const [y] = useAnimatedNumber(vector[1], initial[1], { duration, impulse });

  const max = maxSpan([x.span, y.span]);

  return useMemo(() => {
    return { type: 'cubic-bezier-2d', x, y, max };
  }, [...vector]);
};
export const calculateBezier2DPoint = (
  anim/*: CubicBezier2DAnimation*/,
  now/*: DOMHighResTimeStamp*/
)/*: CubicBezier2DPoint*/ => {
    const x = calculateCubicBezierAnimationPoint(anim.x, now);
    const y = calculateCubicBezierAnimationPoint(anim.y, now);
    const progress = [x.progress, y.progress];
    const position = [x.position, y.position];
    const velocity = [x.velocity, y.velocity];
    const acceleration = [x.acceleration, y.acceleration];
    const point = {
      progress,
      position,
      velocity,
      acceleration
    };
    return point;
};
export const useBezier2DAnimation = (
  anim/*: CubicBezier2DAnimation*/,
  onAnimate/*: CubicBezier2DPoint => mixed*/,
  deps/*: mixed[]*/ = [],
) => {
  const span = maxSpan([anim.x.span, anim.y.span]);
  useTimeSpan(span, (now) => {
    const point = calculateBezier2DPoint(anim, now);
    onAnimate(point);
  }, [anim, ...deps]);
}