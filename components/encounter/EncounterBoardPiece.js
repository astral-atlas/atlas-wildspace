// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { Vector3D, BoxBoardArea } from "@astral-atlas/wildspace-models";

import type { EncounterLocalState } from "./Encounter";
*/

import { SpriteMaterial, TextureLoader, Vector2, Vector3 } from "three";
import { h, useRef } from "@lukekaalim/act";

import { maxSpan, useTimeSpan, useAnimatedNumber } from "@lukekaalim/act-curve";
import { sprite, useDisposable } from "@lukekaalim/act-three";

import { isVector3DEqual } from "@astral-atlas/wildspace-models";

import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";

/*::
export type EncounterBoardPieceProps = {
  textureURL: ?string,
  boardBox: BoxBoardArea,
  piece: { area: { position: Vector3D }, pieceId: string },
  encounter: EncounterLocalState
};
*/

export const EncounterBoardPiece/*: Component<EncounterBoardPieceProps>*/ = ({
  encounter,
  piece,
  boardBox,
  textureURL,
}) => {
  const ref = useRef();
  

  const material = useDisposable(() => {
    const map = textureURL ? new TextureLoader()
      .load(textureURL) : null;

    return new SpriteMaterial({ map, opacity: 0.5 })
  }, [textureURL])


  const selected = encounter.selection && encounter.selection.pieceId == piece.pieceId;
  const hover = encounter.cursor && isVector3DEqual(piece.area.position, encounter.cursor.position)

  const [selectionAnim] = useAnimatedNumber(selected ? 3 : 0, 0, { duration: 300, impulse: 12 });
  const [hoverAnim] = useAnimatedNumber((hover || selected) ? 1 : 0.5, 0, { duration: 100, impulse: 0.3 });

  const positionAnim = useAnimatedVector2(
    [piece.area.position.x, piece.area.position.y],
    [piece.area.position.x, piece.area.position.y],
    3, 300);
  const slowPositionAnim = useAnimatedVector2(
    [piece.area.position.x, piece.area.position.y],
    [piece.area.position.x, piece.area.position.y],
    0, 300);

  useTimeSpan(maxSpan([selectionAnim.span, hoverAnim.span, positionAnim.max]), (now) => {
    const { current: mini } = ref;
    if (!mini)  
      return;

    const hoverPoint = calculateCubicBezierAnimationPoint(hoverAnim, now);
    const selectionPoint = calculateCubicBezierAnimationPoint(selectionAnim, now);

    const positionPoint = calculateBezier2DPoint(positionAnim, now);
    const slowPositionPoint = calculateBezier2DPoint(slowPositionAnim, now);

    const x = (positionPoint.position[0] + 0.5 + Math.floor(boardBox.size.x/2)) * 10;
    const z = (positionPoint.position[1] + 0.5 + Math.floor(boardBox.size.y/2)) * 10;
    const velocity = Math.sqrt(
      Math.pow(slowPositionPoint.velocity[0], 2) +
      Math.pow(slowPositionPoint.velocity[1], 2)
    );
    const y = selectionPoint.position + ((hoverPoint.position - 0.5) * 2 * 0.5) + velocity;

    material.opacity = hoverPoint.position;
    mini.position.set(x, y, z);
  }, [hover, selected]);


  return h(sprite, {
    ref,
    material,
    size: new Vector2(10, 10),
    center: new Vector2(0.5, 0),
    scale: new Vector3(10, 10, 10)
  })
};