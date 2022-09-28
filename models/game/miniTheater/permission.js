// @flow strict

/*::
import type { Character } from "../../character";
import type { MiniTheater } from "./miniTheater";
import type { PlacePieceAction } from "./action";
import type { MiniTheaterAction } from "./action.js";
import type { EditingLayer, EditingLayerID } from "./editingLayer";
import type { PieceID } from "./piece";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
*/
import { isPieceRepresentsEqual } from "./piece.js";
import { getActionPieceId, getMiniTheaterLayer, getMiniTheaterPiece } from "./utils.js";

export const hasLayerPermission = (layer/*: EditingLayer*/)/*: boolean*/ => {
  return layer.permissions.type === 'players-in-game';
};

export const isPermissableAction = (
  action/*: MiniTheaterAction*/,
  miniTheater/*: MiniTheater*/,
)/*: boolean*/ => {
  switch (action.type) {
    case 'set-terrain':
      return false;
    case 'remove-piece':
    case 'move-piece': {
      const pieceId = getActionPieceId(action);
      const piece = getMiniTheaterPiece(miniTheater, pieceId);
      const layer = getMiniTheaterLayer(miniTheater, piece.layer);
      return hasLayerPermission(layer);
    }
    case 'place-piece': {
      const layer = getMiniTheaterLayer(miniTheater, action.layer);
      return hasLayerPermission(layer)
        && isValidPlacementInLayer(action, miniTheater, layer);
    }
  }
}

export const isValidPlacementInLayer = (
  placeAction/*: PlacePieceAction*/,
  miniTheater/*: MiniTheater*/,
  layer/*: EditingLayer*/
)/*: boolean*/ => {
  return layer.placementRules.every(rule => {
    switch (rule.type) {
      case 'unique-represents':
        return !!miniTheater.pieces
          .filter(p => p.layer === layer)
          .find(p => isPieceRepresentsEqual(p.represents, placeAction.pieceRepresents))
      default:
        return false;
    }
  })
}