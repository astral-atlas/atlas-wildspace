// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type {
  MiniTheater,
  Character,
  MonsterActorMask,
  MiniVector, MiniQuaternion,
} from "@astral-atlas/wildspace-models";
import type { Group, PerspectiveCamera } from "three";

import type { MiniTheaterController } from "./useMiniTheaterController";
import type { RenderSetup } from "../three/useRenderSetup";

import type { EncounterResources } from "../encounter/useResources";
import type { AssetDownloadURLMap } from "../asset/map";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { SwampResources } from "../encounter/useSwampResources";
import type { MiniTheaterMode } from "./useMiniTheaterMode";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
*/
import { h, useEffect, useMemo, useRef } from "@lukekaalim/act"
import { group, perspectiveCamera, scene } from "@lukekaalim/act-three"

import { Box2, Vector2 } from "three";

import { useMiniTheaterSceneController } from "./useMiniTheaterSceneController";
import { useMiniTheaterCamera } from "./useMiniTheaterCamera";
import { MiniTheaterCursorRenderer } from "./MiniTheaterCursorRenderer";
import { BoardRenderer } from "../board/BoardRenderer";
import { useSky } from "../sky/useSky";
import { calculateBoardBox, createFloorForTerrain } from "@astral-atlas/wildspace-models";
import { MiniTheaterPieceRenderer } from "./MiniTheaterPieceRenderer";
import { useMiniTheaterMode } from "./useMiniTheaterMode";

/*::

export type MiniTheaterSceneProps = {
  mode: MiniTheaterMode,
  miniTheater: MiniTheater,

  render: RenderSetup,
  resources: MiniTheaterRenderResources,
  
  controlSurfaceElementRef?: ?Ref<?HTMLElement>,
};
*/
const HARDCODED_BOARD = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: {
      position: { x: 1, y: 0, z: 0 },
      size: { x: 30, y: 24, z: 1 }
    } },
    { type: 'box', box: {
      position: { x: 5, y: 5, z: 10 },
      size: { x: 5, y: 5, z: 1 }
    } },
  ]
};

export const MiniTheaterScene/*: Component<MiniTheaterSceneProps>*/ = ({
  mode,
  miniTheater,

  render,
  resources,

  controlSurfaceElementRef = null,
}) => {
  
  const sceneController = useMiniTheaterSceneController(
    miniTheater,
    controlSurfaceElementRef || (render.canvasRef/*: any*/),
    mode.type === "full-control" ? mode.controller : null,
    render.loop
  )
  
  const bounds = new Box2(
    new Vector2(-100, -100).multiplyScalar(10),
    new Vector2(100, 100).multiplyScalar(10)
  )

  useMiniTheaterMode(
    mode,
    render.loop,
    render.cameraRef,
    (render.canvasRef/*: any*/),
    [render]
  );

  const onCursorOver = (position) => {
    if (mode.type === "full-control" || mode.type === "stalled-control")
      mode.controller.act({ type: 'move-cursor', cursor: position });
  };
  const onCursorLeave = () => {
    if (mode.type === "full-control" || mode.type === "stalled-control")
      mode.controller.act({ type: 'move-cursor', cursor: null });
  }
  // Trash
  const sky = useSky(220, 0);
  const lightRef = useRef();
  const lightTargetRef = useRef();

  const groupRef = useRef/*:: <?Group>*/()

  const floors = [];

  const board = HARDCODED_BOARD;

  const controller = (
    (mode.type === "full-control" || mode.type === "stalled-control")
    && mode.controller
    || null
  );

  return [
    h(group, { ref: groupRef }),
    h(perspectiveCamera, { ref: render.cameraRef }),
    h(BoardRenderer, { board, raycaster: sceneController.raycaster, onCursorOver, onCursorLeave }, [
      //controller &&
        //h(MiniTheaterCursorRenderer, { resources, controller, resources }),
      //miniTheater.pieces.map(piece =>
        //h(MiniTheaterPieceRenderer, { key: piece.id, controller, piece, resources}))
    ]),
  ]
}