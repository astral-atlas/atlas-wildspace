// @flow strict

import { c } from "@lukekaalim/cast";
import { castPiece } from "./piece.js";
import { castMiniTheater, castMiniTheaterVersion } from "./miniTheater.js";

/*::
import type { MiniTheater, MiniTheaterVersion } from "./miniTheater";
import type { Cast } from "@lukekaalim/cast";
import type { Piece } from "./piece";
*/

/*::
export type MiniTheaterUpdateEvent = {
  type: 'update',
  next: MiniTheater,
}
*/

export const castMiniTheaterUpdateEvent/*: Cast<MiniTheaterUpdateEvent>*/ = c.obj({
  type: c.lit('update'),
  next: castMiniTheater
});

/*::
export type MiniTheaterUpdatePiecesEvent = {
  type: 'update-pieces',
  pieces: $ReadOnlyArray<Piece>,
  version: MiniTheaterVersion,
}
*/

export const castMiniTheaterUpdatePiecesEvent/*: Cast<MiniTheaterUpdatePiecesEvent>*/ = c.obj({
  type: c.lit('update-pieces'),
  pieces: c.arr(castPiece),
  version: castMiniTheaterVersion,
});

/*::
export type MiniTheaterEvent =
  | MiniTheaterUpdatePiecesEvent
  | MiniTheaterUpdateEvent
*/

export const castMiniTheaterEvent/*: Cast<MiniTheaterEvent>*/ = c.or('type', {
  'update-pieces': castMiniTheaterUpdatePiecesEvent,
  'update': castMiniTheaterUpdateEvent,
});