// @flow strict
/*::
import type { Mesh, Vector2 } from "three";

import type { Component, Ref } from "@lukekaalim/act";
import type { Board, BoxBoardArea, BoardPosition } from "@astral-atlas/wildspace-models";

import type { RaycastManager } from "../raycast";
*/
import { Vector3 } from "three";

import { h, useRef, useMemo, useEffect } from "@lukekaalim/act";
import { group } from "@lukekaalim/act-three";
import { calculateBoardBox, isPointOnBoardFloor } from "@astral-atlas/wildspace-models";

import { localToTilemapPosition } from "../tilemap";
import { useRefMap } from "../editor";

import { BoardLineGrid } from "./BoardLineGridRenderer.js";


const tilemapToBoardPosition = (tilemapPosition/*: Vector2*/, boardBox/*: BoxBoardArea*/)/*: BoardPosition*/ => ({
  x: tilemapPosition.x - Math.floor(boardBox.size.x/2),
  y: tilemapPosition.y - Math.floor(boardBox.size.y/2),
  z: 0,
});

const boardPositionToLocalVector = (position/*: BoardPosition*/, boardBox)/*: Vector3*/ => {
  return new Vector3(
    (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
    (position.z * 10),
    (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
  )
}

/*::
export type BoardRendererProps = {
  raycaster: RaycastManager,
  board: Board,
  onCursorOver?: (position: BoardPosition) => mixed,
  onCursorLeave?: () => mixed,
}
*/

export const BoardRenderer/*: Component<BoardRendererProps>*/ = ({
  board,
  children,
  raycaster,
  onCursorOver = _ => {},
  onCursorLeave = () => {},
}) => {
  const boardBox = useMemo(() => {
    return calculateBoardBox(board);
  }, [board]);

  const ref = useRef();
  const boardGroupRef = useRef();
  const [createRef, refMap] = useRefMap/*:: <number, ?Mesh>*/();

  useEffect(() => {
    const { current: boardGroup } = ref;
    if (!boardGroup)
      return;

    const unsubscribeAll = [...refMap]
      .map(([layer, boardMesh]) => {
        if (!boardMesh)
          return null;
        const isHit = (i) => {
          const localVector = boardGroup.worldToLocal(i.point);
          const p = tilemapToBoardPosition(localToTilemapPosition(localVector, 10), boardBox);
          return isPointOnBoardFloor(({ ...p, z: layer }), board);
        }
        const unsubscribe = raycaster.subscribe(boardMesh, {
          over(i) {
            const localVector = boardGroup.worldToLocal(i.point);
            const p = tilemapToBoardPosition(localToTilemapPosition(localVector, 10), boardBox);
            onCursorOver({ ...p, z: layer });
          },
          exit() {
            onCursorLeave()
          }
        }, isHit);
        return unsubscribe;
      })
      .filter(Boolean);
    
    return () => {
      for (const unsubscribe of unsubscribeAll)
        unsubscribe();
    }
  }, [board, raycaster]);

  const boardCenter = useMemo(() =>
    boardPositionToLocalVector({ x: 0, y: 0, z: 0 }, boardBox),
    [boardBox]
  );
  
  return [
    h(group, { ref }, useMemo(() => {
      return Array.from({ length: boardBox.size.z }).map((_, i) => {
        const layer = i - Math.floor(boardBox.size.z / 2) + boardBox.position.z;
        return h(BoardLineGrid, { ref: createRef(layer), board, boardBox, layer })
      });
    }, [boardBox])),
    h(group, { position: boardCenter, ref: boardGroupRef }, [
      children,
    ]),
  ];
};