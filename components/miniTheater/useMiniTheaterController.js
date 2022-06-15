// @flow strict
/*::
import type {
  PieceID,
  MiniTheaterAction,
  BoardPosition, MonsterActorID, CharacterID
} from '@astral-atlas/wildspace-models';
import type { Ref } from "@lukekaalim/act";
*/

import { useSubscriptionList } from "../subscription";
import { useMemo, useRef, useState } from "@lukekaalim/act"
import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

/*::
export type MiniTheaterPlacement =
  | { type: 'character', characterId: CharacterID }
  | { type: 'monster', monsterActorId: MonsterActorID }
  | { type: 'terrain', terrainType: string }

export type MiniTheaterController = {
  subscribePieceMove: (handler: (event: { pieceRef: PieceID, position: BoardPosition }) => mixed) => () => void,
  subscribePieceAdd: (handler: (event: { placement: MiniTheaterPlacement, position: BoardPosition, }) => mixed) => () => void,
  subscribePieceRemove: (handler: (event: { pieceRef: PieceID }) => mixed) => () => void,

  subscribeAction: (handler: (action: MiniTheaterAction) => mixed) => () => void,

  cursorRef: Ref<?{ position: BoardPosition }>,
  subscribeCursor: (handler: (event: ?{ position: BoardPosition }) => mixed) => () => void,

  selectionRef: Ref<?{ pieceRef: PieceID }>,
  subscribeSelection: (handler: (event: ?{ pieceRef: PieceID }) => mixed) => () => void,

  placementRef: Ref<?{ placement: MiniTheaterPlacement }>,
  subscribePlacement: (handler: (event: ?{ placement: MiniTheaterPlacement }) => mixed) => () => void,

  moveCursor: (position: BoardPosition) => void,
  clearCursor: () => void,

  selectPiece: (pieceRef: PieceID) => void,
  deselectPiece: () => void,
  movePiece: (piece: PieceID, position: BoardPosition) => void,

  pickPlacement: (placement: MiniTheaterPlacement) => void, 
  clearPlacement: () => void, 

  addPiece: (placement: MiniTheaterPlacement, position: BoardPosition) => void,
  removePiece: (piece: PieceID) => void,
};
*/

export const useMiniTheaterController = ()/*: MiniTheaterController*/ => {
  const cursorRef = useRef();
  const selectionRef = useRef();
  const placementRef = useRef();

  const [subscribeCursor,, invokeCursor] = useSubscriptionList()
  const [subscribeSelection,, invokeSelection] = useSubscriptionList()
  const [subscribePlacement,, invokePlacement] = useSubscriptionList()

  const [subscribePieceMove,, invokePieceMove] = useSubscriptionList()
  const [subscribePieceAdd,, invokePieceAdd] = useSubscriptionList()
  const [subscribePieceRemove,, invokePieceRemove] = useSubscriptionList()
  const [subscribeAction,, invokeAction] = useSubscriptionList()

  return useMemo(() => {
    const moveCursor = (position) => {
      if (cursorRef.current && isBoardPositionEqual(position, cursorRef.current.position))
        return;
      
      cursorRef.current = { position };
      invokeCursor(cursorRef.current);
    };
    const clearCursor = () => {
      cursorRef.current = null
      invokeCursor(null);
    };
    const selectPiece = (pieceRef) => {
      clearPlacement();
      selectionRef.current = { pieceRef };
      invokeSelection(selectionRef.current)
    };
    const deselectPiece = () => {
      selectionRef.current = null;
      invokeSelection(null)
    };
    const movePiece = (pieceRef, position) => {
      invokePieceMove({ pieceRef, position });
      return void invokeAction({ type: 'move', movedPiece: pieceRef, position })
    };
    const addPiece = (placement, position) => {
      clearPlacement();
      invokePieceAdd({ placement, position })
      switch (placement.type) {
        case 'monster':
          return void invokeAction({ type: 'place', placement: { ...placement, position, visible: true }})
        case 'character':
          return void invokeAction({ type: 'place', placement: { ...placement, position, visible: true }})
        case 'terrain':
          return void invokeAction({ type: 'place', placement: { ...placement, position, visible: true }})
      }
    };
    const removePiece = (pieceRef) => {
      deselectPiece();
      invokePieceRemove({ pieceRef })
      return void invokeAction({ type: 'remove', removedPiece: pieceRef })
    }
    const pickPlacement = (placement) => {
      deselectPiece();
      placementRef.current = { placement };
      console.log('INVOKE', placement)
      invokePlacement(placementRef.current);
    };
    const clearPlacement = () => {
      placementRef.current = null;
      invokePlacement(null);
    }
    return {
      cursorRef,
      selectionRef,
      placementRef,

      subscribeCursor,
      subscribeSelection,
      subscribePlacement,

      subscribePieceMove,
      subscribePieceAdd,
      subscribePieceRemove,
      subscribeAction,

      moveCursor,
      clearCursor,
      selectPiece,
      deselectPiece,
      movePiece,
      addPiece,
      removePiece,
      pickPlacement,
      clearPlacement,
    }
  }, [])
}