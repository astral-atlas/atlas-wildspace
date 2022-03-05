// @flow strict

/*:: import type { RaycastManager } from "../raycast"; */
/*:: import type { Board, BoardPiece, BoardPieceID } from "./board"; */
/*:: import type { Object3D } from "three"; */

import { useMemo, useRef, useState } from "@lukekaalim/act";

/*::
export type PieceFocusManager = {
  focusedPieceId: ?BoardPieceID,

  onCanvasClick: (event: MouseEvent) => void,
  onDirectClick: (pieceId: BoardPieceID) => void,

  setPieceRef: BoardPieceID => ?Object3D => void,
}
*/

const usePieceFocus = (board/*: Board*/)/*: PieceFocusManager*/ => {
  const [focusedPieceId, setFocusedPieceId] = useState(null);

  const onCanvasClick = (event) => {
    const intersection = raycast.lastIntersectionRef.current;
    if (!intersection)
      return;
    const pieceId = objectPieceIds.get(intersection.object);
    setFocusedPieceId(pieceId)
  };
  const onDirectClick = (pieceId/*: BoardPieceID*/) => {
    setFocusedPieceId(pieceId)
  };

  // A map that, for any object in the scene, you might find it's associated piece id
  const [objectPieceIds] = useState(new Map());

  const setPieceRef = (pieceId/*: BoardPieceID*/) => (object/*: ?Object3D*/) => {
    if (!object) {
      const prevObjectEntry = [...objectPieceIds.entries()].find(([, id]) => id === pieceId);
      if (prevObjectEntry)
        objectPieceIds.delete(prevObjectEntry[0]);
    }
    else
      objectPieceIds.set(object, pieceId);
  };

  const manager = {
    focusedPieceId,

    onCanvasClick,
    onDirectClick,
    setPieceRef,
  };

  return manager;
};
