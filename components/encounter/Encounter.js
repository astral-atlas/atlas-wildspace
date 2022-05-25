// @flow strict
/*::
import type { BoxBoardArea, Board, Vector3D } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { PerspectiveCamera } from "three";

import type { KeyboardTrack, KeyboardStateEmitter } from "../keyboard";
import type { RaycastManager } from "../raycast/manager";
*/
import { useState,  h, useEffect } from "@lukekaalim/act";

import { encounterContext } from "./encounterContext";
import { isPointInsideBoardBox, isPointOnBoardFloor, isVector3DEqual, calculateBoardBox } from "@astral-atlas/wildspace-models";
import { useBoardCameraControl } from "../camera/useBoardCameraControl";
import { Vector2, Vector3 } from "three";
import { useSubscriptionList } from "../subscription";

/*::
export type Encounter2Props = {
  cameraRef: Ref<?PerspectiveCamera>,
  canvasRef: Ref<?HTMLCanvasElement>,
  board: Board,
  gameArea: BoxBoardArea,
  keyboard: KeyboardTrack,
  raycast: RaycastManager
}
*/


const boardPositionToLocalVector = (position/*: Vector3D*/, boardBox)/*: Vector3*/ => {
  return new Vector3(
    (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
    (position.z * 10),
    (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
  )
}

export const Encounter2 /*: Component<Encounter2Props>*/= ({
  children,
  cameraRef,
  raycast,
  keyboard,
  gameArea,
  board,
}) => {
  const [hover, setHover] = useState/*:: <null | { boardId: string, boardPosition: Vector3D }>*/(null);
  const [selection, setSelection] = useState/*:: <null | { pieceId: string }>*/(null);

  const start = boardPositionToLocalVector({ x: 0, y: 0, z: 0}, gameArea);

  useBoardCameraControl(cameraRef, keyboard.readAll,
    40,
    new Vector2(start.x, start.z),
    { ...gameArea,
      size: { ...gameArea.size, x: gameArea.size.x + 1, y: gameArea.size.y + 1 }
    })

  const onBoardPointerEnter = () => {
    
  }
  const onBoardPointerMove = (boardId, boardPosition) => {
    setHover(prevHover => {
      if (!prevHover) {
        const isFloor = isPointOnBoardFloor(boardPosition, board);
        return isFloor ? { boardId, boardPosition } : null;
      }
      if (prevHover.boardId !== boardId) {
        const isFloor = isPointOnBoardFloor(boardPosition, board);
        return isFloor ? { boardId, boardPosition } : null;
      }
      if (isVector3DEqual(prevHover.boardPosition, boardPosition))
        return prevHover;

      const isFloor = isPointOnBoardFloor(boardPosition, board);
      return isFloor ? { boardId, boardPosition } : null;
    })
  }
  const onBoardPointerLeave = () => {
    setHover(null);
  }
  const onBoardSelect = (selected) => {
    setSelection(selected);
  }

  const encounterState = {
    hover,
    selection,
    boardEvents: {
      onBoardPointerEnter,
      onBoardPointerMove,
      onBoardPointerLeave,

      onBoardSelect
    }
  }

  return h(encounterContext.Provider, { value: encounterState }, children)
}


/*::
export type Encounter3Props = {
  canvasRef: Ref<?HTMLCanvasElement>,
  cameraRef: Ref<?PerspectiveCamera>,

  pieces: $ReadOnlyArray<{
    boardId: string,
    pieceId: string,
    area: BoxBoardArea
  }>,


  keyboard: KeyboardTrack,

  board: Board,
};

export type EncounterLocalState = {
  subscribePieceMove: (handler: (event: { pieceId: string, position: Vector3D }) => mixed) => () => void,

  cursor: ?{ boardId: string, position: Vector3D },
  selection: ?{ pieceId: string },

  moveCursor: (boardId: string, position: Vector3D) => void,
  clearCursor: () => void,
}
*/

export const useEncounter = ({
  canvasRef,
  cameraRef,
  keyboard,
  board,
  pieces,
}/*: Encounter3Props*/)/*: EncounterLocalState*/ => {
  const [cursor, setCursor] = useState/*:: <?{ boardId: string, position: Vector3D }>*/(null);
  const [selection, setSelection] = useState/*:: <?{ pieceId: string }>*/(null);

  const [subscribePieceMove, pieceMoveRef] = useSubscriptionList();

  useBoardCameraControl(
    cameraRef, keyboard.readAll,
    40,
    new Vector2(20, 20),
    calculateBoardBox(board)
  )

  const moveCursor = (boardId, position) => {
    setCursor({ boardId, position });
  }
  const clearCursor = () => {
    setCursor(null);
  }

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas)
      return;
    const onContextMenu = (e/*: MouseEvent*/) => {
      setCursor(cursor => {
        if (!cursor || !selection)
          return cursor;
        e.preventDefault();

        const event = {
          pieceId: selection.pieceId,
          position: cursor.position
        }
        for (const subscriber of pieceMoveRef.current)
          subscriber(event)

        return cursor;
      })
    };
    const onClick = () => {
      setCursor(cursor => {
        if (!cursor)
          return cursor;
          
        const piece = pieces.find(piece =>
          piece.boardId === cursor.boardId &&
          isPointInsideBoardBox(cursor.position, piece.area)
        )
        setSelection(piece ? { pieceId: piece.pieceId } : null);
          
        return cursor;
      })
    }
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('click', onClick);
    };
  }, [selection && selection.pieceId, pieces]);

  return {
    subscribePieceMove,

    cursor,
    selection,

    moveCursor,
    clearCursor,
  }
}
