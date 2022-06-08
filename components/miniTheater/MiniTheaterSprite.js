// @flow strict
/*::
import type { BoardPosition } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { SpriteMaterial } from "three";
*/


import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";
import {
  calculateVector3BezierAnimationPoint,
  useAnimatedVector3,
} from "../animation/3d";
import { h, useRef } from "@lukekaalim/act";
import { maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve";
import { calculateSpanProgress } from "@lukekaalim/act-curve";
import { sprite } from "@lukekaalim/act-three";

import { Vector2, Vector3 } from "three";

/*::
export type MiniTheaterSpriteProps = {
  selected: boolean,
  hover: boolean,
  position: BoardPosition,

  material: SpriteMaterial,
};
*/
export const MiniTheaterSprite/*: Component<MiniTheaterSpriteProps>*/ = ({
  selected,
  hover,
  position,

  material
}) => {
  const ref = useRef();
  

  const [selectionAnim] = useAnimatedNumber(selected ? 3 : 0, 0, { duration: 300, impulse: 12 });
  const [hoverAnim] = useAnimatedNumber((hover || selected) ? 1 : 0.5, 0, { duration: 100, impulse: 0.3 });

  const [positionAnim] = useAnimatedVector3(
    new Vector3(position.x, position.z, position.y),
    new Vector3(position.x, position.z + 1, position.y),
    500, 3
  );
  const [smoothPositionAnim] = useAnimatedVector3(
    new Vector3(position.x, position.z, position.y),
    new Vector3(position.x, position.z + 1, position.y),
    500, 0
  );

  const span = maxSpan([selectionAnim.span, hoverAnim.span, positionAnim.span]);

  useTimeSpan(span, (now) => {
    const { current: mini } = ref;
    if (!mini)  
      return;

    const hoverPoint = calculateCubicBezierAnimationPoint(hoverAnim, now);
    const selectionPoint = calculateCubicBezierAnimationPoint(selectionAnim, now);

    const positionPoint = calculateVector3BezierAnimationPoint(positionAnim, now);
    const smoothPositionPoint = calculateVector3BezierAnimationPoint(smoothPositionAnim, now);

    const x = (positionPoint.position.x) * 10;
    const z = (positionPoint.position.z) * 10;
    const velocity = smoothPositionPoint.velocity.length();
    
    const y = (positionPoint.position.y * 10) + selectionPoint.position + ((hoverPoint.position - 0.5) * 2 * 0.5) + velocity;

    material.opacity = hoverPoint.position;
    mini.position.set(x, y, z);
  }, [hover, selected, positionAnim]);


  return h(sprite, {
    ref,
    material,
    size: new Vector2(10, 10),
    center: new Vector2(0.5, 0),
    scale: new Vector3(10, 10, 10)
  })
}