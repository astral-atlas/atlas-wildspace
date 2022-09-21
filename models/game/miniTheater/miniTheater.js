// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";

import type { Character, CharacterID } from "../../character";
import type { BoardPosition } from "../../encounter/map";
import type { MonsterActor, MonsterActorID } from "../../monster/monsterActor";
import type { BoxBoardArea } from "../../encounter/board";
import type { Game } from "../game";
import type {
  TerrainPlacement,
  TerrainProp,
  TerrainPropID,
} from "./terrain";
import type { MiniQuaternion, MiniVector } from "./primitives";
import type { Piece, PieceID } from "./piece";
import type { EditingLayer } from "./editingLayer";
*/

import { c } from "@lukekaalim/cast";

import { castBoardPosition } from "../../encounter.js";
import { castPiece } from "./piece.js";
import { castTerrainPlacement } from "./terrain.js";
import { castEditingLayer } from "./editingLayer.js";

export const castBoxBoardArea/*: Cast<BoxBoardArea>*/ = c.obj({
  size: castBoardPosition,
  position: castBoardPosition,
})

/*::
export type MiniTheaterID = string;
export type MiniTheaterVersion = string;
export type MiniTheater = {
  id: MiniTheaterID,
  name: string,
  version: MiniTheaterVersion,

  baseArea: BoxBoardArea,
  pieces: $ReadOnlyArray<Piece>,
  terrain: $ReadOnlyArray<TerrainPlacement>,
  layers: $ReadOnlyArray<EditingLayer>
};
*/

export const castMiniTheaterId/*: Cast<MiniTheaterID>*/ = c.str;
export const castMiniTheaterVersion/*: Cast<MiniTheaterVersion>*/ = c.str;
export const castMiniTheater/*: Cast<MiniTheater>*/ = c.obj({
  id: castMiniTheaterId,
  name: c.str,
  version: castMiniTheaterVersion,

  baseArea: castBoxBoardArea,
  pieces: c.arr(castPiece),
  terrain: c.arr(castTerrainPlacement),
  layers: c.arr(castEditingLayer),
});
