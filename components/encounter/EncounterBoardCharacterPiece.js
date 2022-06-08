// @flow strict


/*::
import type { Component } from "@lukekaalim/act";
import type { Character, BoxBoardArea, Vector3D, Piece } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterContext } from "./encounterContext";
import type { EncounterLocalState } from "./Encounter";
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
import { EncounterBoardPiece } from "./EncounterBoardPiece";

/*::
export type EncounterBoardPieceProps = {
  encounter: EncounterLocalState,
  piece: Piece,
  character: Character,
  assets: AssetDownloadURLMap,
}
*/


export const EncounterBoardCharacterPiece/*: Component<EncounterBoardPieceProps>*/ = ({
  encounter,
  piece,
  character,
  assets,
}) => {
  const asset = character.initiativeIconAssetId ? assets.get(character.initiativeIconAssetId) : null;
  return h(EncounterBoardPiece, {
    encounter,
    piece,
    textureURL: asset && asset.downloadURL,
  });
};