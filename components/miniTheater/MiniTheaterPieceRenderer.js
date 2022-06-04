// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {
  Vector3D, BoxBoardArea, Piece, 
  MiniPieceRef,
  MiniTheaterView,
  BoardPosition,
} from "@astral-atlas/wildspace-models";

import type { MiniTheaterController } from "./useMiniTheaterController";
*/

import { SpriteMaterial, TextureLoader, Vector2, Vector3 } from "three";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";

import { maxSpan, useTimeSpan, useAnimatedNumber, calculateSpanProgress } from "@lukekaalim/act-curve";
import { sprite, useDisposable } from "@lukekaalim/act-three";

import { isMiniPieceRefEqual, isBoardPositionEqual } from "@astral-atlas/wildspace-models";

import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";
import { useAnimatedVector3 } from "../animation";

/*::
export type MiniTheaterPieceRendererProps = {
  controller: MiniTheaterController,

  textureURL: ?string,
  position: BoardPosition,
  pieceRef: MiniPieceRef,
};
*/

export const MiniTheaterPieceRenderer/*: Component<MiniTheaterPieceRendererProps>*/ = ({
  controller,

  pieceRef,
  position,
  textureURL,
}) => {
  const ref = useRef();
  
  const material = useDisposable(() => {
    const map = textureURL ? new TextureLoader()
      .load(textureURL) : null;

    return new SpriteMaterial({ map, opacity: 0.5 })
  }, [textureURL])


  const [selected, setSelected] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const unsubscribeSelection = controller.subscribeSelection((selection) => {
      setSelected(selection && isMiniPieceRefEqual(selection.pieceRef, pieceRef))
    })
    const unsubscribeCursor = controller.subscribeCursor((cursor) => {
      setHover(cursor && isBoardPositionEqual(cursor.position, position))
    })
    return () => {
      unsubscribeSelection();
      unsubscribeCursor();
    }
  }, [pieceRef, controller])

  const [selectionAnim] = useAnimatedNumber(selected ? 3 : 0, 0, { duration: 300, impulse: 12 });
  const [hoverAnim] = useAnimatedNumber((hover || selected) ? 1 : 0.5, 0, { duration: 100, impulse: 0.3 });

  const [positionAnim] = useAnimatedVector3(
    new Vector3(position.x, position.z, position.y),
    new Vector3(0, 0, 0),
    500, 3
  );

  const slowPositionAnim = useAnimatedVector2(
    [position.x, position.y],
    [position.x, position.y],
    0, 500);

  useTimeSpan(maxSpan([selectionAnim.span, hoverAnim.span, positionAnim.span]), (now) => {
    const { current: mini } = ref;
    if (!mini)  
      return;

    const hoverPoint = calculateCubicBezierAnimationPoint(hoverAnim, now);
    const selectionPoint = calculateCubicBezierAnimationPoint(selectionAnim, now);

    const positionPoint = positionAnim.shape.getPoint(calculateSpanProgress(positionAnim.span, now));
    const slowPositionPoint = calculateBezier2DPoint(slowPositionAnim, now);

    const x = (positionPoint.x) * 10;
    const z = (positionPoint.z) * 10;
    const velocity = Math.sqrt(
      Math.pow(slowPositionPoint.velocity[0], 2) +
      Math.pow(slowPositionPoint.velocity[1], 2)
    );
    const y = (positionPoint.y * 10) + selectionPoint.position + ((hoverPoint.position - 0.5) * 2 * 0.5) + velocity;

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
};