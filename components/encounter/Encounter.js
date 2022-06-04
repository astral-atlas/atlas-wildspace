// @flow strict
/*::
import type { BoxBoardArea, Board, Vector3D, Piece } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { Box3 } from "three";

import type { KeyboardTrack, KeyboardStateEmitter } from "../keyboard";
import type { RaycastManager } from "../raycast";
import type { LoopController } from "../three";
*/
import { useState,  h, useEffect } from "@lukekaalim/act";

import { encounterContext } from "./encounterContext";
import { isPointInsideBoardBox, isPointOnBoardFloor, isVector3DEqual, calculateBoardBox } from "@astral-atlas/wildspace-models";
import { useBoardCameraControl } from "../camera/useBoardCameraControl";
import { Box2, PerspectiveCamera, Vector2, Vector3 } from "three";
import { useSubscriptionList } from "../subscription";
import { useParticle2dSimulation } from "../particle";
import { getVector2ForKeyboardState, getVectorForKeys } from "../keyboard/axis";
import { setFocusTransform2 } from "../utils/vector";
import { calculateKeyVelocity } from "../keyboard";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve";
import { useRaycastManager } from "../raycast/manager";
import { useRaycastElement } from "../raycast";

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

/*::
export type Encounter3Props = {
  canvasRef: Ref<?HTMLCanvasElement>,
  cameraRef: Ref<?PerspectiveCamera>,

  loop: LoopController,

  pieces: $ReadOnlyArray<Piece>,
  boards: $ReadOnlyArray<Board>,

  cameraBounds: Box2,

  keyboard: KeyboardTrack,
};

export type EncounterController = {
  subscribePieceMove: (handler: (event: { pieceId: string, position: Vector3D }) => mixed) => () => void,

  cursor: ?{ boardId: string, position: Vector3D },
  focus: ?{ boardId: string, position: Vector3D },
  selection: ?{ pieceId: string },

  raycaster: RaycastManager,


  focusBoard: (boardId: string, position: Vector3D) => void,
  moveCursor: (boardId: string, position: Vector3D) => void,
  clearCursor: () => void,
}
export type EncounterLocalState = EncounterController;
*/

const useEncounterCamera = (
  keyboard/*: KeyboardTrack*/,
  canvasRef/*: Ref<?HTMLCanvasElement>*/,
  cameraRef/*: Ref<?PerspectiveCamera>*/,
  loop/*: LoopController*/,
  cameraBounds/*: ?Box2*/,
) => {
  const [cameraParticle, simulate] = useParticle2dSimulation(
    cameraBounds,
    0.005,
    0.05,
    cameraBounds && cameraBounds.getCenter(new Vector2(0, 0))
  );
  const [rotation, setRotation] = useState/*:: <number>*/(0.125);
  const [rotationAnim] = useAnimatedNumber(rotation, rotation, { duration: 400, impulse: (0.125 * 3) });

  const [zoom, setZoom] = useState/*:: <number>*/(32);
  const [zoomAnim] = useAnimatedNumber(zoom, zoom, { duration: 400, impulse: 3 });

  useEffect(() => {
    const { current: camera } = cameraRef;
    const { current: canvas } = canvasRef;
    if (!camera || !canvas)
      return;

    const onWheel = (event/*: WheelEvent*/) => {
      if (document.activeElement !== canvas)
        return;
      event.preventDefault();
      setZoom(z => Math.min(1000, Math.max(10, z + (event.deltaY / 10))));
    }
    const onSimulate = (c, v) => {
      const keys = keyboard.readDiff();
      const keysVelocity = calculateKeyVelocity(keys.prev.value, keys.next.value);
      if (keysVelocity.get('KeyQ') === -1)
        setRotation(r => r - 0.125)
      if (keysVelocity.get('KeyE') === -1)
        setRotation(r => r + 0.125)
  
      const rotationPoint = calculateCubicBezierAnimationPoint(rotationAnim, v.now);
      const zoomPoint = calculateCubicBezierAnimationPoint(zoomAnim, v.now);

      const rotationRadians = rotationPoint.position * 2 * Math.PI;
      const acceleration = getVector2ForKeyboardState(keys.next.value)
        .multiplyScalar(0.0015)
        .rotateAround(new Vector2(0, 0), rotationRadians);
  
      simulate(acceleration, v.delta);
  
      setFocusTransform2(
        new Vector3(cameraParticle.position.x, 0, -cameraParticle.position.y),
        0.25 + rotationPoint.position,
        new Vector2(-zoomPoint.position, zoomPoint.position),
        camera,
      );
    }

    canvas.addEventListener('wheel', onWheel);
    const unsubscribeSim = loop.subscribeSimulate(onSimulate);

    return () => {
      unsubscribeSim();
      canvas.removeEventListener('wheel', onWheel);
    }
  }, [rotationAnim, zoomAnim])
};


export const useEncounterController = ({
  canvasRef,
  cameraRef,
  keyboard,
  cameraBounds,
  loop,

  pieces,
  boards,
}/*: Encounter3Props*/)/*: EncounterLocalState*/ => {
  const [cursor, setCursor] = useState/*:: <?{ boardId: string, position: Vector3D }>*/(null);
  const [selection, setSelection] = useState/*:: <?{ pieceId: string }>*/(null);
  const [focus, setFocus] = useState(null);

  const [subscribePieceMove, pieceMoveRef] = useSubscriptionList();

  const raycaster = useRaycastManager()
  useRaycastElement(raycaster, canvasRef);
  useEffect(() => {
    return loop.subscribeSimulate((c, v) => raycaster.onUpdate(c.camera))
  }, [loop, raycaster])

  useEncounterCamera(keyboard, canvasRef, cameraRef, loop, cameraBounds);

  const moveCursor = (boardId, position) => {
    setCursor(prev => {
      if (prev && isVector3DEqual(prev.position, position))
        return prev;
      const board = boards.find(b => b.id === boardId);
      if (!board)
        return null;
      const isFloor = board.floors.some(f => isPointInsideBoardBox(position, f.box))
      if (!isFloor)
        return;
      return { boardId, position }
    });
  }
  const clearCursor = () => {
    setCursor(null);
  }
  const focusBoard = () => {

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
        if (!cursor) {
          setSelection(null);
          return cursor;
        }
          
        const piece = pieces.find(piece =>
          piece.boardId === cursor.boardId &&
          isPointInsideBoardBox(cursor.position, piece.area.box)
        )
        setSelection(piece ? { pieceId: piece.id } : null);
          
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
    focus,

    raycaster,

    moveCursor,
    clearCursor,
    focusBoard,
  }
}

export const useEncounter = useEncounterController;