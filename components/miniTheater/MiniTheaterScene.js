// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type {
  MiniTheater,
  Character,
  MonsterActorMask,
} from "@astral-atlas/wildspace-models";
import type { Group, PerspectiveCamera } from "three";

import type { MiniTheaterController } from "./useMiniTheaterController";
import type { RenderSetup } from "../three/useRenderSetup";

import type { EncounterResources } from "../encounter/useResources";
import type { AssetDownloadURLMap } from "../asset/map";
import type { KeyboardStateEmitter } from "../keyboard/changes";
*/
import { h, useEffect, useRef } from "@lukekaalim/act"
import { group, perspectiveCamera, scene } from "@lukekaalim/act-three"

import { Box2, Vector2 } from "three";

import { useMiniTheaterSceneController } from "./useMiniTheaterSceneController";
import { useMiniTheaterCamera } from "./useMiniTheaterCamera";
import { MiniTheaterCursorRenderer } from "./MiniTheaterCursorRenderer";
import { BoardRenderer } from "../board/BoardRenderer";
import { useSky } from "../sky/useSky";
import { calculateBoardBox, createFloorForTerrain } from "@astral-atlas/wildspace-models";
import { MiniTheaterPieceRenderer } from "./MiniTheaterPieceRenderer";

/*::
export type MiniTheaterSceneProps = {
  miniTheater: MiniTheater,

  render: RenderSetup,
  resources: EncounterResources,

  characters: $ReadOnlyArray<Character>,
  monsterMasks: $ReadOnlyArray<MonsterActorMask>,
  assets: AssetDownloadURLMap,
  
  controller: MiniTheaterController,
  emitter?: KeyboardStateEmitter,
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
  miniTheater,
  render,
  controller,
  resources,

  assets,
  monsterMasks,
  characters,
  emitter,
  controlSurfaceElementRef = null,
}) => {
  
  const sceneController = useMiniTheaterSceneController(
    miniTheater,
    controlSurfaceElementRef || (render.canvasRef/*: any*/),
    controller,
    render.loop,
    emitter
  )
  
  const boardBox = calculateBoardBox(HARDCODED_BOARD);

  const bounds = new Box2(
    new Vector2(-100, -100).multiplyScalar(10),
    new Vector2(100, 100).multiplyScalar(10)
  )
  
  useMiniTheaterCamera(
    sceneController.keyboardTrack,
    controlSurfaceElementRef || (render.canvasRef/*: any*/),
    render.cameraRef,
    render.loop,
    bounds,
  )
  
  const onCursorOver = (position) => {
    controller.moveCursor(position);
  };
  const onCursorLeave = () => {
    controller.clearCursor()
  }
  // Trash
  const sky = useSky(220, 0);
  const lightRef = useRef();
  const lightTargetRef = useRef();

  const groupRef = useRef/*:: <?Group>*/()

  const data = {
    assets,
    characters,
    monsterMasks,
  }
  /*
  useEffect(() => {
    const { current: root } = groupRef;
    const { current: light } = lightRef;
    const { current: lightTarget } = lightTargetRef;
    
    if (!root || !light || !lightTarget)
      return;

    light.target = lightTarget;

    root.add(sky);
    root.add(resources.pirateScene);

    sky.scale.setScalar( 4500 );
    const boardPositionToLocalVector = (position, boardBox) => {
      return new Vector3(
        (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
        (position.z * 10),
        (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
      )
    }
    resources.pirateScene.position.copy(boardPositionToLocalVector({ x: 1, y: -1, z: 0 }, boardBox).add(new Vector3(0, 0, 5)))
    resources.pirateScene.translateY(-2)

    return () => {
      root.remove(resources.pirateScene);
      root.remove(sky);
    }
  }, [resources])
  */

  const board = {
    ...HARDCODED_BOARD,
    floors: [
      ...HARDCODED_BOARD.floors,
      ...miniTheater.pieces
        .map(piece => {
          const { represents } = piece;
          if (represents.type !== 'terrain')
            return [];

          return createFloorForTerrain(represents.terrainType, piece.position, piece.visible)
        })
        .flat(1)
    ]
  }

  return [
    h(group, { ref: groupRef }),
    h(perspectiveCamera, { ref: render.cameraRef }),
    h(BoardRenderer, { board, raycaster: sceneController.raycaster, onCursorOver, onCursorLeave }, [
      h(MiniTheaterCursorRenderer, { data, controller, resources }),
      miniTheater.pieces.map(piece =>
        h(MiniTheaterPieceRenderer, { key: piece.id, controller, piece, assets, characters, monsterMasks }))
    ]),
  ]
}