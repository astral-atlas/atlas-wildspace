// @flow strict

import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";
import { h, useMemo, useRef, useEffect } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, maxSpan, useAnimatedNumber, useTimeSpan } from "@lukekaalim/act-curve";
import { mesh, sprite, useDisposable } from "@lukekaalim/act-three";
import { BoxGeometry, SpriteMaterial, Vector2, Vector3 } from "three";
import { getPieceAssetId } from "./MiniTheaterPieceRenderer";
import {
  calculateVector3BezierAnimationPoint,
  useAnimatedVector3,
} from "../animation/3d";

/*::
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
import type { MiniTheaterLocalState } from "./useMiniTheaterController2";
*/

/*::
export type MiniTheaterPiecesRendererProps = {
  miniTheaterState: MiniTheaterLocalState
}
*/

const cube = new BoxGeometry(10, 10, 10)
  .translate(0, 5, 0);
const center = new Vector2(0.5, 0.5)
const scale = new Vector3(10, 10, 10)

export const MiniTheaterPiecesRenderer/*: Component<MiniTheaterPiecesRendererProps>*/ = ({
  miniTheaterState,
}) => {
  const { pieces } = miniTheaterState.miniTheater;

  return pieces.map(piece => {
    return h(PieceRenderer, { key: piece.id, piece, miniTheaterState });
  })

};

const PieceRenderer = ({ piece, miniTheaterState }) => {
  const { resources, cursor, selection } = miniTheaterState;

  // State Values
  const selected = selection.type === 'piece' && selection.pieceId === piece.id;
  const hovering = cursor && isBoardPositionEqual(cursor, piece.position);
  const unfocused = selection.type !== 'none' && !selected;

  // Resources
  const assetId = getPieceAssetId(piece.represents, resources) || null;
  const texture = assetId && resources.textureMap.get(assetId);

  if (!assetId)
    return null;

  if (!texture) {
    console.warn('No Texture Found', piece.represents)
    return h(mesh, { geometry: cube });
  }

  const material = useDisposable(() => {
    return new SpriteMaterial({
      map: texture,
      opacity: 1,
    })
  }, [texture])
  
  // Animation
  const [hoverAnim] = useAnimatedNumber(hovering ? 0.5 : 0, 0, { duration: 200, impulse: 1.5 })
  const [selectAnim] = useAnimatedNumber(selected ? 1 : 0, 0, { duration: 200, impulse: 3 });
  const [unfocusAnim] = useAnimatedNumber(unfocused ? 1 : 0, 0, { duration: 400, impulse: 3 })

  const position = new Vector3(piece.position.x, piece.position.z, piece.position.y);
  position.multiplyScalar(10);
  const [positionAnim] = useAnimatedVector3(position, position, 300, 30)

  const spriteRef = useRef();

  useTimeSpan(maxSpan([hoverAnim.span, selectAnim.span, unfocusAnim.span, positionAnim.span]), (now) => {
    const hover = calculateCubicBezierAnimationPoint(hoverAnim, now);
    const select = calculateCubicBezierAnimationPoint(selectAnim, now);
    const unfocus = calculateCubicBezierAnimationPoint(unfocusAnim, now);
    const positionPoint = calculateVector3BezierAnimationPoint(positionAnim, now);
    const { current: sprite } = spriteRef;
    if (!sprite)
      return;
    
    sprite.position.copy(positionPoint.position)
      .add(new Vector3(0, (hover.position + select.position) * 5, 0))
    material.opacity = 1 - (unfocus.position / 2);
  }, [unfocusAnim, selectAnim, hoverAnim, positionAnim, material]);

  return h(sprite, {
    ref: spriteRef,
    material,
    center,
    scale
  });
}