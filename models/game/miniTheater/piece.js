// @flow strict

import { c } from "@lukekaalim/cast";
import { castBoardPosition } from "../../encounter/map.js";
import { castEditingLayerID } from "./editingLayer.js";
import { castCharacterId } from "../../character.js";
import { castMonsterActorId } from "../../monster/monsterActor.js";

/*::
import type { CharacterID } from "../../character";
import type { BoardPosition } from "../../encounter/map";
import type { MonsterActorID } from "../../monster/monsterActor";
import type { EditingLayerID } from "./editingLayer";
import type { Cast } from "@lukekaalim/cast";

export type PieceRepresents =
  | { type: 'character', characterId: CharacterID }
  | { type: 'monster', monsterActorId: MonsterActorID }

export type PieceID = string;
export type Piece = {
  id: PieceID,
  position: BoardPosition,
  visible: boolean,
  layer: EditingLayerID,

  represents: PieceRepresents
}
*/
export const castPieceRepresents/*: Cast<PieceRepresents>*/ = c.or('type', {
  'character': c.obj({ type: c.lit('character'), characterId: castCharacterId }),
  'monster': c.obj({ type: c.lit('monster'), monsterActorId: castMonsterActorId }),
});

export const castPieceId/*: Cast<PieceID>*/ = c.str;
export const castPiece/*: Cast<Piece>*/ = c.obj({
  id: castPieceId,
  position: castBoardPosition,
  visible: c.bool,
  layer: castEditingLayerID,

  represents: castPieceRepresents
});

export const isPieceRepresentsEqual = (a/*: PieceRepresents*/, b/*: PieceRepresents*/)/*: boolean*/ => {
  switch (a.type) {
    case 'character':
      return b.type === 'character' && a.characterId == b.characterId;
    case 'monster':
      return b.type === 'monster' && a.monsterActorId == b.monsterActorId;
  }
}