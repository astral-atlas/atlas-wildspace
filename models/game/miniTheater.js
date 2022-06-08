// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";

import type { Character, CharacterID } from "../character";
import type { BoardPosition } from "../encounter/map";
import type { MonsterActor, MonsterActorID } from "../monster/monsterActor";
import type { Game } from "./game";
*/

import { c } from "@lukekaalim/cast";
import { v4 as uuid } from 'uuid';

import { castBoardPosition } from "../encounter.js";
import { castCharacterId } from "../character.js";
import { castMonsterActorId } from "../monster/monsterActor.js";

/*::
export type PieceID = string;
export type Piece = {
  id: PieceID,
  position: BoardPosition,
  visible: boolean,

  represents:
    | { type: 'character', characterId: CharacterID }
    | { type: 'monster', monsterActorId: MonsterActorID }
}
*/

export const castPieceId/*: Cast<PieceID>*/ = c.str;
export const castPiece/*: Cast<Piece>*/ = c.obj({
  id: castPieceId,
  position: castBoardPosition,
  visible: c.bool,

  represents: c.or('type', {
    'character': c.obj({ type: c.lit('character'), characterId: castCharacterId }),
    'monster': c.obj({ type: c.lit('monster'), monsterActorId: castMonsterActorId })
  })
});

/*::
export type MiniTheaterID = string;
export type MiniTheaterVersion = string;
export type MiniTheater = {
  id: MiniTheaterID,
  name: string,
  version: MiniTheaterVersion,

  pieces: $ReadOnlyArray<Piece>,
};
*/

export const castMiniTheaterId/*: Cast<MiniTheaterID>*/ = c.str;
export const castMiniTheaterVersion/*: Cast<MiniTheaterVersion>*/ = c.str;
export const castMiniTheater/*: Cast<MiniTheater>*/ = c.obj({
  id: castMiniTheaterId,
  name: c.str,
  version: castMiniTheaterVersion,

  pieces: c.arr(castPiece),
});

/*::
export type MiniTheaterPiecePlacement =
  | { type: 'monster', monsterActorId: MonsterActorID, position: BoardPosition, visible: boolean }
  | { type: 'character', characterId: CharacterID, position: BoardPosition, visible: boolean }


export type MiniTheaterAction =
  | { type: 'move', movedPiece: PieceID, position: BoardPosition }
  | { type: 'place', placement: MiniTheaterPiecePlacement }
  | { type: 'remove', removedPiece: PieceID }
  | { type: 'toggle-visibility', pieceId: PieceID, visible: boolean }
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
    visible: c.bool,
  })
})

export const castMiniTheaterAction/*: Cast<MiniTheaterAction>*/ = c.or('type', {
  'move': c.obj({
    type: c.lit('move'),
    movedPiece: castPieceId,
    position: castBoardPosition,
  }),
  'place': c.obj({
    type: c.lit('place'),
    placement: castMiniTheaterPiecePlacement,
  }),
  'remove': c.obj({
    type: c.lit('remove'),
    removedPiece: castPieceId,
  }),
  'set-visible': c.obj({
    type: c.lit('toggle-visibility'),
    pieceId: castPieceId,
    visible: c.bool,
  }),
})

const createPiece = (placement) => {
  switch (placement.type) {
    case 'monster':
      return {
        id: uuid(),
        represents: {
          type: 'monster',
          monsterActorId: placement.monsterActorId,
        },
        position: placement.position,
        visible: placement.visible
      }
    case 'character':
      return {
        id: uuid(),
        represents: {
          type: 'character',
          characterId: placement.characterId,
        },
        position: placement.position,
        visible: placement.visible
      }
  }
}

export const isMiniTheaterActionAuthorized = (
  action/*: MiniTheaterAction*/,
  miniTheater/*: MiniTheater*/,
  game/*: Game*/,
  charactersInGame/*: $ReadOnlyArray<Character>*/,
  userId/*: UserID*/,
)/*: boolean*/ => {
  const isGameMaster = game.gameMasterId === userId;
  if (isGameMaster)
    return true;

  const getCharacterForPiece = (piece) => {
    const { represents } = piece;
    if (represents.type !== 'character')
      return null;
    return charactersInGame.find(c => c.id === represents.characterId);
  }
  const getCharacterForPlacement = (placement) => {
    if (placement.type !== 'character')
      return null;
    return charactersInGame.find(c => c.id === placement.characterId);
  }
  const isOwnCharacterPiece = (pieceId) => miniTheater.pieces.some(p => {
    const isPiece = p.id === pieceId
    if (!isPiece)
      return false;
    const character = getCharacterForPiece(p);
    return character && character.playerId === userId;
  });
  const isOwnCharacterPlacement = (placement) => {
    const character = getCharacterForPlacement(placement)
    return !!character && character.id === userId;
  }

  switch (action.type) {
    case 'move':
      return isOwnCharacterPiece(action.movedPiece);
    case 'place':
      return isOwnCharacterPlacement(action.placement)
    case 'remove':
      return isOwnCharacterPiece(action.removedPiece);
    case 'toggle-visibility':
      return isOwnCharacterPiece(action.pieceId);
    default:
      return false;
  }
}

export const createMiniTheaterEventFromAction = (action/*: MiniTheaterAction*/, nextTheater/*: MiniTheater*/)/*: MiniTheaterEvent*/ => {
  switch (action.type) {
    case 'move':
      return { type: 'position', position: action.position, movedPiece: action.movedPiece, version: nextTheater.version }
    default:
      return { type: 'update', miniTheater: nextTheater }
  }
}

export const reduceMiniTheaterAction = (miniTheater/*: MiniTheater*/, action/*: MiniTheaterAction*/)/*: MiniTheater*/ => {
  switch (action.type) {
    case 'move':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces.map(p =>
          p.id === action.movedPiece ? { ...p, position: action.position } : p),
      }
    case 'place':
      return {
        ...miniTheater,
        pieces: [
          ...miniTheater.pieces,
          createPiece(action.placement)
        ]
      };
    case 'remove':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces
          .filter(p => p.id !== action.removedPiece)
      };
    case 'toggle-visibility':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces.map(p =>
          p.id === action.pieceId ? { ...p, visible: action.visible } : p),
      }
  }
}

/*::
export type MiniTheaterEvent =
  | { type: 'position', movedPiece: PieceID, position: BoardPosition, version: MiniTheaterVersion }
  | { type: 'update', miniTheater: MiniTheater }
*/

export const castMiniTheaterEvent/*: Cast<MiniTheaterEvent>*/ = c.or('type', {
  'position': c.obj({
    type: c.lit('position'),
    movedPiece: castPieceId,
    position: castBoardPosition,
    version: castMiniTheaterVersion
  }),
  'update': c.obj({
    type: c.lit('update'),
    miniTheater: castMiniTheater
  })
})

export const reduceMiniTheaterEvent = (miniTheater/*: MiniTheater*/, event/*: MiniTheaterEvent*/)/*: MiniTheater*/ => {
  switch (event.type) {
    case 'position':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces.map(p => p.id === event.movedPiece ? { ...p, position: event.position } : p),
        version: event.version,
      };
    case 'update':
      return event.miniTheater;
    default:
      return miniTheater;
  }
}