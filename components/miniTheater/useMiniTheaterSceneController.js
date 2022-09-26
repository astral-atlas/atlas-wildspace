// @flow strict
/*::
import type { Ref, Deps } from "@lukekaalim/act";
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { KeyboardTrack } from "../keyboard/track";
import type { RaycastManager } from "../raycast/manager";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { LoopController } from "../three/useLoopController";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "./useMiniTheaterController2";
*/

import { useElementKeyboard } from "../keyboard/changes";
import { useKeyboardTrack } from "../keyboard/track";
import { useRaycastManager } from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { useEffect, useState } from "@lukekaalim/act";
import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

/*::
export type MiniTheaterSceneController = {
  raycaster: RaycastManager,
}
*/

export const useMiniTheaterSceneController = (
  miniTheater/*: MiniTheater*/,
  controlSurfaceElementRef/*: Ref<?HTMLElement>*/,
  miniTheaterController/*: ?MiniTheaterController2*/,
  loop/*: LoopController*/,
  deps/*: mixed[]*/ = [],
)/*: MiniTheaterSceneController*/ => {
  const [localTheaterState, setLocalTheaterState] = useState/*:: <?MiniTheaterLocalState>*/(null)
  useEffect(() => {
    if (!miniTheaterController)
      return;
   const { unsubscribe } = miniTheaterController.subscribe(setLocalTheaterState)
   return () => {
    unsubscribe();
   }
  }, [miniTheaterController]);

  const raycaster = useRaycastManager();
  useRaycastElement(raycaster, controlSurfaceElementRef);
  useEffect(() => {
    return loop.subscribeSimulate((c, v) => raycaster.onUpdate(c.camera))
  }, [])

  useEffect(() => {
    const { current: controlSurfaceElement } = controlSurfaceElementRef;
    if (!controlSurfaceElement || !miniTheaterController || !localTheaterState)
      return;
    const onContextMenu = (e/*: MouseEvent*/) => {
      if (e.target !== controlSurfaceElement)
        return;
      e.preventDefault();
      controlSurfaceElement.focus();
      const { cursor, selection, layer } = localTheaterState;
      if (!cursor || !layer)
        return;
      switch (selection.type) {
        case 'none':
          return;
        case 'piece':
          return miniTheaterController.act({ type: 'remote-action', remoteAction: {
            type: 'move-piece',
            movedPiece: selection.pieceId,
            position: cursor
          } });
        case 'placement':
          switch (selection.placement.type) {
            case 'piece':
              return miniTheaterController.act({ type: 'remote-action', remoteAction: {
                type: 'place-piece',
                layer,
                pieceRepresents: selection.placement.represents,
                position: cursor
              } });
            default:
              return;
          }
        case 'terrain-prop':
          return;
      }
    };
    const onClick = (e/*: MouseEvent*/) => {
      if (e.target !== controlSurfaceElement)
        return;
      e.preventDefault();
      controlSurfaceElement.focus();
      const { cursor, selection, layer } = localTheaterState;
      if (!layer)
        return;
      if (!cursor || selection.type === 'placement')
        return miniTheaterController.act({ type: 'select', selection: { type: 'none' } });
            
      const selectedPiece = miniTheater.pieces.find(p => isBoardPositionEqual(p.position, cursor));
      if (!selectedPiece)
        return miniTheaterController.act({ type: 'select', selection: { type: 'none' } });
        
      return miniTheaterController.act({ type: 'select', selection: { type: 'piece', pieceId: selectedPiece.id }})
    }
    controlSurfaceElement.addEventListener('contextmenu', onContextMenu);
    controlSurfaceElement.addEventListener('click', onClick);

    return () => {
      controlSurfaceElement.removeEventListener('contextmenu', onContextMenu);
      controlSurfaceElement.removeEventListener('click', onClick);
    };
  }, [miniTheaterController, localTheaterState, miniTheater.pieces, ...deps]);

  return {
    raycaster,
  }
}