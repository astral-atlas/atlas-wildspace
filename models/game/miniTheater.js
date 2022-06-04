// @flow strict
/*::
import type { CharacterID } from "../character";
import type { BoardPosition } from "../encounter/map";
import type { PieceID } from "../encounter/piece";
import type { MonsterActor, MonsterActorID } from "../monster/monsterActor";
import type { Cast } from "@lukekaalim/cast/main";
*/

import { c } from "@lukekaalim/cast";
import { v4 as uuid } from 'uuid';

import { castBoardPosition } from "../encounter.js";
import { castCharacterId } from "../character.js";
import { castMonsterActorId } from "../monster/monsterActor.js";

/*::
export type CharacterPieceID = string;
export type CharacterPiece = {
  id: CharacterPieceID,
  position: BoardPosition,
  characterId: CharacterID
}
export type MonsterPieceID = string;
export type MonsterPiece = {
  id: MonsterPieceID,
  visible: boolean,
  position: BoardPosition,
  monsterActorId: MonsterActorID
}

export type MiniPieceRef =
  | { type: 'character', characterPieceId: CharacterPieceID }
  | { type: 'monster', monsterPieceId: MonsterPieceID }
*/

export const castCharacterPieceId/*: Cast<CharacterPieceID>*/ = c.str;
export const castCharacterPiece/*: Cast<CharacterPiece>*/ = c.obj({
  id: castCharacterPieceId,
  position: castBoardPosition,
  characterId: castCharacterId
});

export const castMonsterPieceId/*: Cast<MonsterPieceID>*/ = c.str;
export const castMonsterPiece/*: Cast<MonsterPiece>*/ = c.obj({
  id: castMonsterPieceId,
  visible: c.bool,
  position: castBoardPosition,
  monsterActorId: castMonsterActorId
});

export const castMiniPieceRef/*: Cast<MiniPieceRef>*/ = c.or('type', {
  'character': c.obj({ type: c.lit('character'), characterPieceId: castCharacterPieceId }),
  'monster': c.obj({ type: c.lit('monster'), monsterPieceId: castCharacterPieceId }),
})
export const isMiniPieceRefEqual = (a/*: MiniPieceRef*/, b/*: MiniPieceRef*/)/*: boolean*/ => {
  if (a.type === 'monster' && b.type === 'monster') {
    return a.monsterPieceId === b.monsterPieceId;
  } else if (a.type === 'character' && b.type === 'character') {
    return a.characterPieceId === b.characterPieceId;
  }
  return false;
}

/*::
export type MiniTheaterID = string;
export type MiniTheaterVersion = string;
export type MiniTheater = {
  id: MiniTheaterID,
  name: string,
  version: MiniTheaterVersion,

  characterPieces: $ReadOnlyArray<CharacterPiece>,
  monsterPieces: $ReadOnlyArray<MonsterPiece>,
};
*/

export const castMiniTheaterId/*: Cast<MiniTheaterID>*/ = c.str;
export const castMiniTheaterVersion/*: Cast<MiniTheaterVersion>*/ = c.str;
export const castMiniTheater/*: Cast<MiniTheater>*/ = c.obj({
  id: castMiniTheaterId,
  name: c.str,
  version: castMiniTheaterVersion,

  characterPieces: c.arr(castCharacterPiece),
  monsterPieces: c.arr(castMonsterPiece),
});

/*::
export type MiniTheaterPiecePlacement =
  | { type: 'monster', monsterActorId: MonsterActorID, position: BoardPosition, visible: boolean }
  | { type: 'character', characterId: CharacterID, position: BoardPosition }


export type MiniTheaterAction =
  | { type: 'move', movedPiece: MiniPieceRef, position: BoardPosition }
  | { type: 'place', placement: MiniTheaterPiecePlacement }
  | { type: 'remove', removedPiece: MiniPieceRef }
  | { type: 'set-visible', monsterPiece: MonsterPieceID, visible: boolean }
*/
export const castMiniTheaterPiecePlacement/*: Cast<MiniTheaterPiecePlacement>*/ = c.or('type', {
  monster: c.obj({
    type: c.lit('monster'),
    monsterActorId: castMonsterActorId,
    position: castBoardPosition,
    visible: c.bool,
  }),
  character: c.obj({
    type: c.lit('character'),
    characterId: castCharacterId,
    position: castBoardPosition,
  })
})

export const castMiniTheaterAction/*: Cast<MiniTheaterAction>*/ = c.or('type', {
  'move': c.obj({
    type: c.lit('move'),
    movedPiece: castMiniPieceRef,
    position: castBoardPosition,
  }),
  'place': c.obj({
    type: c.lit('place'),
    placement: castMiniTheaterPiecePlacement,
  }),
  'remove': c.obj({
    type: c.lit('remove'),
    removedPiece: castMiniPieceRef,
  }),
  'set-visible': c.obj({
    type: c.lit('set-visible'),
    monsterPiece: castMonsterPieceId,
    visible: c.bool,
  }),
})

/*::
export type MiniTheaterEvent =
  | { type: 'position', movedPiece: MiniPieceRef, position: BoardPosition, version: MiniTheaterVersion }
  | { type: 'update', miniTheater: MiniTheater }
*/

export const castMiniTheaterEvent/*: Cast<MiniTheaterEvent>*/ = c.or('type', {
  'position': c.obj({
    type: c.lit('position'),
    movedPiece: castMiniPieceRef,
    position: castBoardPosition,
    version: castMiniTheaterVersion
  }),
  'update': c.obj({
    type: c.lit('update'),
    miniTheater: castMiniTheater
  })
})

export const reduceMiniTheater = (theater/*: MiniTheater*/, event/*: MiniTheaterEvent*/)/*: MiniTheater*/ => {
  switch (event.type) {
    case 'position':
      const { movedPiece, position } = event;
      switch (movedPiece.type) {
        case 'character':
          return {
            ...theater,
            characterPieces: theater.characterPieces.map(c =>
              c.id === movedPiece.characterPieceId ? { ...c, position } : c)
          };
        case 'monster':
          return {
            ...theater,
            monsterPieces: theater.monsterPieces.map(m =>
              m.id === movedPiece.monsterPieceId ? { ...m, position } : m)
          };
        default:
          return theater;
      }
    case 'update':
      return event.miniTheater;
    default:
      return theater;
  }
}