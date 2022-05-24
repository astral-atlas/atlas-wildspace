// @flow strict


/*::
import type { Component } from "@lukekaalim/act";
import type { Character, BoxBoardArea, Vector3D } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterContext } from "./encounterContext";
import type { EncounterState } from "./Encounter";
*/

import { h, useContext, useRef } from "@lukekaalim/act";
import { sprite, useDisposable } from "@lukekaalim/act-three";
import { TextureLoader, Vector2, Vector3, SpriteMaterial } from "three";
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";
import { maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import { encounterContext } from "./encounterContext";
import { isVector3DEqual } from "@astral-atlas/wildspace-models";
import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";

/*::
export type EncounterBoardPieceProps = {
  encounter: EncounterState,
  boardBox: BoxBoardArea,
  piece: { pieceId: string, area: BoxBoardArea },
  character: Character,
  assets: AssetDownloadURLMap,
}
*/


export const EncounterBoardCharacterPiece/*: Component<EncounterBoardPieceProps>*/ = ({
  encounter,
  piece,
  character,
  assets,
  boardBox,
}) => {
  const ref = useRef();
  const asset = character.initiativeIconAssetId && assets.get(character.initiativeIconAssetId);
  const material = useDisposable(() => {
    const map = asset ? new TextureLoader().load(asset.downloadURL) : null;

    return new SpriteMaterial({ map, opacity: 0.5 })
  }, [asset && asset.downloadURL])


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