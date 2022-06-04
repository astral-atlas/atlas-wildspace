// @flow strict
/*::
import type { MiniPieceRef, BoardPosition, MonsterActorID } from '@astral-atlas/wildspace-models';
import type { Ref } from "@lukekaalim/act";
*/

import { useSubscriptionList } from "../subscription";
import { useMemo, useRef, useState } from "@lukekaalim/act"
import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

/*::
export type MiniTheaterPlacement =
  | { type: 'character', characterId: BoardPosition }
  | { type: 'monster', monsterActorId: MonsterActorID }

export type MiniTheaterController = {
  subscribePieceMove: (handler: (event: { pieceRef: MiniPieceRef, position: BoardPosition }) => mixed) => () => void,
  subscribePieceAdd: (handler: (event: { placement: MiniTheaterPlacement, position: BoardPosition }) => mixed) => () => void,
  subscribePieceRemove: (handler: (event: { pieceRef: MiniPieceRef }) => mixed) => () => void,

  cursorRef: Ref<?{ position: BoardPosition }>,
  subscribeCursor: (handler: (event: ?{ position: BoardPosition }) => mixed) => () => void,

  selectionRef: Ref<?{ pieceRef: MiniPieceRef }>,
  subscribeSelection: (handler: (event: ?{ pieceRef: MiniPieceRef }) => mixed) => () => void,

  placementRef: Ref<?{ placement: MiniTheaterPlacement }>,
  subscribePlacement: (handler: (event: ?{ placement: MiniTheaterPlacement }) => mixed) => () => void,

  moveCursor: (position: BoardPosition) => void,
  clearCursor: () => void,

  selectPiece: (pieceRef: MiniPieceRef) => void,
  deselectPiece: () => void,
  movePiece: (piece: MiniPieceRef, position: BoardPosition) => void,

  pickPlacement: (placement: MiniTheaterPlacement) => void, 
  clearPlacement: () => void, 

  addPiece: (placement: MiniTheaterPlacement, position: BoardPosition) => void,
  removePiece: (piece: MiniPieceRef) => void,
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
    };
    const addPiece = (placement, position) => {
      clearPlacement();
      invokePieceAdd({ placement, position })
    };
    const removePiece = (pieceRef) => {
      deselectPiece();
      invokePieceRemove({ pieceRef })
    }
    const pickPlacement = (placement) => {
      deselectPiece();
      placementRef.current = { placement };
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