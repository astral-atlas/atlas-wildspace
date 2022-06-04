// @flow strict
/*::
import type { Ref, Deps } from "@lukekaalim/act";
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { KeyboardTrack } from "../keyboard/track";
import type { RaycastManager } from "../raycast/manager";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { LoopController } from "../three/useLoopController";
*/

import { useElementKeyboard } from "../keyboard/changes";
import { useKeyboardTrack } from "../keyboard/track";
import { useRaycastManager } from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { useEffect } from "@lukekaalim/act";
import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

/*::
export type MiniTheaterSceneController = {
  raycaster: RaycastManager,
  keyboardTrack: KeyboardTrack
}
*/

export const useMiniTheaterSceneController = (
  miniTheater/*: MiniTheater*/,
  canvasRef/*: Ref<?HTMLCanvasElement>*/,
  miniTheaterController/*: MiniTheaterController*/,
  loop/*: LoopController*/,
  overrideKeyboardEmitter/*: ?KeyboardStateEmitter*/ = null,
  deps/*: mixed[]*/ = [],
)/*: MiniTheaterSceneController*/ => {
  const raycaster = useRaycastManager();
  useRaycastElement(raycaster, canvasRef);
  useEffect(() => {
    return loop.subscribeSimulate((c, v) => raycaster.onUpdate(c.camera))
  }, [])

  const localKeyboardEmitter = useElementKeyboard(canvasRef);
  const keyboardEmitter = overrideKeyboardEmitter || localKeyboardEmitter;

  const keyboardTrack = useKeyboardTrack(keyboardEmitter);

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas)
      return;
    const onContextMenu = (e/*: MouseEvent*/) => {
      e.preventDefault();
      canvas.focus();
      const selected = miniTheaterController.selectionRef.current;
      const placement = miniTheaterController.placementRef.current;
      const cursor = miniTheaterController.cursorRef.current;
      if (!cursor)
        return;
      if (selected) {
        miniTheaterController.movePiece(selected.pieceRef, cursor.position)
      } else if (placement) {
        miniTheaterController.addPiece(placement.placement, cursor.position)
      }
    };
    const onClick = (e/*: MouseEvent*/) => {
      e.preventDefault();
      canvas.focus();

      const cursor = miniTheaterController.cursorRef.current;
      const placement = miniTheaterController.placementRef.current;
      if (placement)
        return miniTheaterController.clearPlacement();
      if (!cursor)
        return miniTheaterController.deselectPiece();
      
      const selectedCharacter = miniTheater.characterPieces.find(c => isBoardPositionEqual(c.position, cursor.position));
      if (selectedCharacter)
        return miniTheaterController.selectPiece({ type: 'character', characterPieceId: selectedCharacter.id })
      const selectedMonster = miniTheater.monsterPieces.find(m => isBoardPositionEqual(m.position, cursor.position));
      if (selectedMonster)
        return miniTheaterController.selectPiece({ type: 'monster', monsterPieceId: selectedMonster.id })
      
      return miniTheaterController.deselectPiece();
    }
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('click', onClick);
    };
  }, [miniTheaterController, ...deps]);

  return {
    raycaster,
    keyboardTrack
  }
}