// @flow strict
/*::
import type { BoardPosition } from "../../encounter/map";
import type { EditingLayer, EditingLayerID } from "./editingLayer";
import type { PieceID, PieceRepresents } from "./piece";
import type { TerrainPlacement } from "./terrain";
import type { Cast } from "@lukekaalim/cast";
*/
import { castBoardPosition } from "../../encounter/map.js";
import { castEditingLayer } from "./editingLayer.js";
import { castEditingLayerID } from "./editingLayer.js";
import { castPieceId, castPieceRepresents } from "./piece.js";
import { castTerrainPlacement } from "./terrain.js";
import { c } from "@lukekaalim/cast";

/*::
export type MovePieceAction = {
  type: 'move-piece',
  movedPiece: PieceID,
  position: BoardPosition
};
*/

export const castMovePieceAction/*: Cast<MovePieceAction>*/ = c.obj({
  type: c.lit('move-piece'),
  movedPiece: castPieceId,
  position: castBoardPosition,
});

/*::
export type PlacePieceAction = {
  type: 'place-piece',
  position: BoardPosition,
  layer: EditingLayerID,
  pieceRepresents: PieceRepresents,
};
*/
export const castPlacePieceAction/*: Cast<PlacePieceAction>*/ = c.obj({
  type: c.lit('place-piece'),
  pieceRepresents: castPieceRepresents,
  layer: castEditingLayerID,
  position: castBoardPosition,
});

/*::
export type RemovePieceAction = {
  type: 'remove-piece',
  removedPiece: PieceID,
};
*/
export const castRemovePieceAction/*: Cast<RemovePieceAction>*/ = c.obj({
  type: c.lit('remove-piece'),
  removedPiece: castPieceId,
});

/*::
export type SetTerrainAction = {
  type: 'set-terrain',
  terrain: $ReadOnlyArray<TerrainPlacement>,
}
export type SetLayersAction = {
  type: 'set-layers',
  layers: $ReadOnlyArray<EditingLayer>,
}
*/
export const castSetTerrainAction/*: Cast<SetTerrainAction>*/ = c.obj({
  type: c.lit('set-terrain'),
  terrain: c.arr(castTerrainPlacement)
});
export const castSetLayersAction/*: Cast<SetLayersAction>*/ = c.obj({
  type: c.lit('set-layers'),
  layers: c.arr(castEditingLayer)
});

/*::
export type MiniTheaterAction =
  | MovePieceAction
  | PlacePieceAction
  | RemovePieceAction
  | SetTerrainAction
  | SetLayersAction
*/

export const castMiniTheaterAction/*: Cast<MiniTheaterAction>*/ = c.or('type', {
  'move-piece': castMovePieceAction,
  'place-piece': castPlacePieceAction,
  'remove-piece': castRemovePieceAction,
  'set-terrain': castSetTerrainAction,
  'set-layers': castSetLayersAction
});
