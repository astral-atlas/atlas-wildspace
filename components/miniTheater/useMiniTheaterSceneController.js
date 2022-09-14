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
}
*/

export const useMiniTheaterSceneController = (
  miniTheater/*: MiniTheater*/,
  controlSurfaceElementRef/*: Ref<?HTMLElement>*/,
  miniTheaterController/*: ?MiniTheaterController*/,
  loop/*: LoopController*/,
  deps/*: mixed[]*/ = [],
)/*: MiniTheaterSceneController*/ => {
  const raycaster = useRaycastManager();
  useRaycastElement(raycaster, controlSurfaceElementRef);
  useEffect(() => {
    return loop.subscribeSimulate((c, v) => raycaster.onUpdate(c.camera))
  }, [])

  useEffect(() => {
    const { current: controlSurfaceElement } = controlSurfaceElementRef;
    if (!controlSurfaceElement || !miniTheaterController)
      return;
    const onContextMenu = (e/*: MouseEvent*/) => {
      if (e.target !== controlSurfaceElement)
        return;
      e.preventDefault();
      controlSurfaceElement.focus();
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
      if (e.target !== controlSurfaceElement)
        return;
      e.preventDefault();
      controlSurfaceElement.focus();

      const cursor = miniTheaterController.cursorRef.current;
      const placement = miniTheaterController.placementRef.current;
      if (placement)
        return miniTheaterController.clearPlacement();
      if (!cursor)
        return miniTheaterController.deselectPiece();
      
      const selectedPiece = miniTheater.pieces.find(p => isBoardPositionEqual(p.position, cursor.position));
      if (selectedPiece)
        return miniTheaterController.selectPiece(selectedPiece.id)
      
      return miniTheaterController.deselectPiece();
    }
    controlSurfaceElement.addEventListener('contextmenu', onContextMenu);
    controlSurfaceElement.addEventListener('click', onClick);

    return () => {
      controlSurfaceElement.removeEventListener('contextmenu', onContextMenu);
      controlSurfaceElement.removeEventListener('click', onClick);
    };
  }, [miniTheaterController, miniTheater.pieces, ...deps]);

  return {
    raycaster,
  }
}