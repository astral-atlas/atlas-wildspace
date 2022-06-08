// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Board, BoxBoardArea, Vector3D } from "@astral-atlas/wildspace-models";

import type { Mesh } from "three";

import type { EncounterController, EncounterLocalState } from "./Encounter";
import type { EncounterResources } from "./useResources";
*/
import { h, useContext, useState, useRef, useMemo, useEffect } from "@lukekaalim/act";
import { group, mesh, useDisposable } from "@lukekaalim/act-three";

import { useBoardBoxGeometry } from "./useBoardGeometry";
import { encounterContext } from "./encounterContext";
import { raycastManagerContext, useRaycast, useRaycastManager } from "../raycast";
import { BoardLineGrid } from "./BoardLineGrid";
import { BoardCursor } from "./BoardCursor";
import { MeshBasicMaterial, Vector2, Vector3, Euler } from "three";
import { calculateBoardBox, isPointInsideBoardBox, isPointOnBoardFloor, mergeBoardBoxArea } from "@astral-atlas/wildspace-models";
import { localToTilemapPosition } from "./Tilemap";
import { useAnimatedList } from "@lukekaalim/act-curve/array";
import { useAnimatedKeyedList } from "../animation/list";
import { createInitialCubicBezierAnimation, interpolateCubicBezierAnimation } from "@lukekaalim/act-curve";
import { resourcesContext } from "./useResources";
import { useRefMap } from "../editor";


const tilemapToBoardPosition = (tilemapPosition/*: Vector2*/, boardBox/*: BoxBoardArea*/)/*: Vector3D*/ => ({
  x: tilemapPosition.x - Math.floor(boardBox.size.x/2),
  y: tilemapPosition.y - Math.floor(boardBox.size.y/2),
  z: 0,
});

const boardPositionToLocalVector = (position/*: Vector3D*/, boardBox)/*: Vector3*/ => {
  return new Vector3(
    (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
    (position.z * 10),
    (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
  )
}

/*::
export type EncounterBoardProps = {
  position?: Vector3,
  rotation?: Euler,
  encounter: EncounterController,
  resources: EncounterResources,
  board: Board,
}
*/

export const EncounterBoard/*: Component<EncounterBoardProps>*/ = ({
  encounter,
  board,
  resources,
  position = new Vector3(0, 0, 0),
  rotation = new Euler(0, 0, 0),
  children,
}) => {
  const boardBox = useMemo(() => {
    return calculateBoardBox(board);
  }, [board]);

  const ref = useRef();
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
        const unsubscribe = encounter.raycaster.subscribe(boardMesh, {
          over(i) {
            const localVector = boardGroup.worldToLocal(i.point);
            const p = tilemapToBoardPosition(localToTilemapPosition(localVector, 10), boardBox);
            encounter.moveCursor(board.id, ({ ...p, z: layer }));
          },
          exit() {
            encounter.clearCursor()
          }
        }, isHit);
        return unsubscribe;
      })
      .filter(Boolean);
    
    return () => {
      for (const unsubscribe of unsubscribeAll)
        unsubscribe();
    }
  }, [board, encounter.raycaster]);

  const cursorPosition = (
    encounter.cursor &&
    encounter.cursor.boardId === board.id &&
    encounter.cursor.position
  );

  const cursorAnims = useAnimatedKeyedList(cursorPosition ? [cursorPosition] : [], t => 'X', ([_, s]) => s.span.start + s.span.durationMs, {
    enter: (v, __, now) => [v, interpolateCubicBezierAnimation(createInitialCubicBezierAnimation(0), 1, 200, 3, now)],
    move: (a) => a,
    update: (a, v) => [v, a[1]], 
    exit: ([v, b], now) => [v, interpolateCubicBezierAnimation(b, 0, 200, 3, now)],
  }, [cursorPosition])

  const boardCenter = useMemo(() =>
    boardPositionToLocalVector({ x: 0, y: 0, z: 0 }, boardBox),
    [boardBox]
  );
  
  return [
    h(group, { ref }, useMemo(() => {
      return Array.from({ length: boardBox.size.z }).map((_, i) => {
        const layer = i - Math.floor(boardBox.size.z / 2) + boardBox.position.z;
        return h(BoardLineGrid, { ref: createRef(layer), board, boardBox, rotation, layer })
      });
    }, [boardBox])),
    h(group, { position: boardCenter.add(position), rotation }, [
      children,
    ]),
    cursorAnims.map(([boardPosition, entryAnim]) => h(BoardCursor, {
      resources,
      entryAnim,
      position: boardPositionToLocalVector(boardPosition, boardBox)
    })),
  ];
};