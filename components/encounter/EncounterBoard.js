// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Board, BoxBoardArea, Vector3D } from "@astral-atlas/wildspace-models";

import type { EncounterState } from "./Encounter";
*/
import { h, useContext, useState, useRef, useMemo, useEffect } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";

import { useBoardBoxGeometry } from "./useBoardGeometry";
import { encounterContext } from "./encounterContext";
import { raycastManagerContext, useRaycast, useRaycastManager } from "../raycast";
import { BoardLineGrid } from "./BoardLineGrid";
import { BoardCursor } from "./BoardCursor";
import { MeshBasicMaterial, Vector2, Vector3 } from "three";
import { calculateBoardBox, isPointInsideBoardBox, isPointOnBoardFloor, mergeBoardBoxArea } from "@astral-atlas/wildspace-models";
import { localToTilemapPosition } from "./Tilemap";
import { useAnimatedList } from "@lukekaalim/act-curve/array";
import { useAnimatedKeyedList } from "../animation/list";
import { createInitialCubicBezierAnimation, interpolateCubicBezierAnimation } from "@lukekaalim/act-curve";
import { resourcesContext } from "./useResources";


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
  encounter: EncounterState,
  board: Board,
}
*/

export const EncounterBoard/*: Component<EncounterBoardProps>*/ = ({
  encounter,
  board,
  children,
}) => {
  const boardBox = useMemo(() => {
    return calculateBoardBox(board);
  }, [board]);

  const ref = useRef();
  const ray = useContext(raycastManagerContext);

  useEffect(() => {
    const { current: boardMesh } = ref;
    if (!ray || !boardMesh)
      return;

    const unsubscribe = ray.subscribe(boardMesh, {
      over(i) {
        const localVector = i.object.worldToLocal(i.point);
        const p = tilemapToBoardPosition(localToTilemapPosition(localVector, 10), boardBox);
        encounter.moveCursor(board.id, p);
      },
      exit() {
        encounter.clearCursor()
      }
    });
    return () => {
      unsubscribe();
    }
  }, [board, ray]);

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

  const resource = useContext(resourcesContext)

  useEffect(() => {
    const { current: root } = ref;
    if (!root)
      return;
    root.add(resource.floatingScene);
    resource.floatingScene.position.copy(boardPositionToLocalVector({ x: 0, y: 0, z: 0 }, boardBox))
    resource.floatingScene.translateY(-2)
    return () => {
      root.remove(resource.floatingScene)
    }
  }, [resource])
  
  return [
    h(BoardLineGrid, { ref, board, boardBox }),
    children,
    cursorAnims.map(([boardPosition, entryAnim]) => h(BoardCursor, {
      entryAnim,
      position: boardPositionToLocalVector(boardPosition, boardBox)
    })),
  ];
};