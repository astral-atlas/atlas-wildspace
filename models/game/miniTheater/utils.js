// @flow strict

/*::
import type { MiniTheater } from "./miniTheater";
import type { MiniTheaterAction, MovePieceAction, RemovePieceAction } from "./action";
import type { EditingLayer, EditingLayerID } from "./editingLayer";
import type { Piece, PieceID } from "./piece";
*/

export const getMiniTheaterPiece = (miniTheater/*: MiniTheater*/, pieceId/*: PieceID*/)/*: Piece*/ => {
  const piece = miniTheater.pieces.find(p => p.id === pieceId);
  if (!piece)
    throw new Error();
  return piece;
}
export const getMiniTheaterLayer = (miniTheater/*: MiniTheater*/, layerId/*: EditingLayerID*/)/*: EditingLayer*/ => {
  const layer = miniTheater.layers.find(l => l.id === layerId);
  if (!layer)
    throw new Error();
  return layer;
}

export const getActionPieceId = (action/*: MovePieceAction | RemovePieceAction*/)/*: PieceID*/ => {
  switch (action.type) {
    case 'remove-piece':
      return action.removedPiece;
    case 'move-piece':
      return action.movedPiece;
  }
}