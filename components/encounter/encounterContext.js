// @flow strict
/*::
import type { Vector3D } from "@astral-atlas/wildspace-models";
import type { Context } from "@lukekaalim/act";
*/
import { createContext } from "@lukekaalim/act";

/*::
export type EncounterContext = {
  hover: null | { boardId: string, boardPosition: Vector3D },
  selection: null | { pieceId: string },

  boardEvents: {
    onBoardPointerEnter: (boardId: string) => void,
    onBoardPointerMove: (boardId: string, boardPosition: Vector3D) => void,
    onBoardPointerLeave: (boardId: string) => void,

    onBoardSelect: (piece: null | { pieceId: string }) => void,
  }
};
*/

export const encounterContext/*: Context<EncounterContext>*/ = createContext({
  hover: null,
  selection: null,
  boardEvents: {
    onBoardPointerEnter: (_) => { throw new Error(); },
    onBoardPointerMove: (_, __) => { throw new Error() },
    onBoardPointerLeave: (_) => { throw new Error() },

    onBoardSelect: (_, __) => { throw new Error() },
  }
});
