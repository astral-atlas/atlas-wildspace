// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { MiniTheater, Board, Character, MonsterActorMask, BoardPosition, BoxBoardArea } from "@astral-atlas/wildspace-models";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterResources } from "../encounter/useResources";
*/

import { h, useEffect, useRef } from "@lukekaalim/act";
import { perspectiveCamera, scene } from "@lukekaalim/act-three";
import {
  Box2,
  OrthographicCamera,
  Vector2,
  Vector3,
  PCFSoftShadowMap,
  Color,
} from "three";

import { useRenderSetup } from "../three/useRenderSetup";
import { useMiniTheaterCamera } from "./useMiniTheaterCamera";
import { useMiniTheaterSceneController } from "./useMiniTheaterSceneController";
import { BoardRenderer } from "../board/BoardRenderer";
import { EncounterBoardPiece } from "../encounter";
import { MiniTheaterPieceRenderer } from "./MiniTheaterPieceRenderer";
import { MiniTheaterCursorRenderer } from "./MiniTheaterCursorRenderer";
import { useResourcesLoader } from "../encounter/useResources";
import classes from './MiniTheaterRenderer.module.css';
import { calculateBoardBox } from "@astral-atlas/wildspace-models";
import { useSky } from "../sky/useSky";

/*::
export type MiniTheaterRendererProps = {
  board: Board,
  controller: MiniTheaterController,
  miniTheaterView: MiniTheater,

  characters: $ReadOnlyArray<Character>,
  monsterMasks: $ReadOnlyArray<MonsterActorMask>,
  assets: AssetDownloadURLMap,

  resources: EncounterResources,
}
*/

const HARDCODED_BOARD = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: {
      position: { x: 1, y: 0, z: 0 },
      size: { x: 30, y: 24, z: 1 }
    } }
  ]
};
const boardPositionToLocalVector = (position/*: BoardPosition*/, boardBox/*: BoxBoardArea*/)/*: Vector3*/ => {
  return new Vector3(
    (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
    (position.z * 10),
    (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
  )
}


export const MiniTheaterRenderer/*: Component<MiniTheaterRendererProps>*/ = ({
  controller, miniTheaterView,
  characters,
  monsterMasks,
  board,
  assets,
  resources,
  children,
}) => {
  const rendering = useRenderSetup({}, ({ renderer }) => {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  });
  const sceneController = useMiniTheaterSceneController(
    miniTheaterView,
    rendering.canvasRef,
    controller,
    rendering.loop
  )
  const boardBox = calculateBoardBox(board);
  const bounds = new Box2(
    new Vector2(-100, -100).multiplyScalar(10),
    new Vector2(100, 100).multiplyScalar(10)
  )
  useMiniTheaterCamera(
    sceneController.keyboardTrack,
    rendering.canvasRef,
    rendering.cameraRef,
    rendering.loop,
    bounds
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

  useEffect(() => {
    const { current: root } = rendering.sceneRef;
    const { current: light } = lightRef;
    const { current: lightTarget } = lightTargetRef;
    
    if (!root || !light || !lightTarget)
      return;

    light.target = lightTarget;

    root.add(sky);
    root.add(resources.pirateScene);

    sky.scale.setScalar( 4500 );
    resources.pirateScene.position.copy(boardPositionToLocalVector({ x: 1, y: -1, z: 0 }).add(new Vector3(0, 0, 5)))
    resources.pirateScene.translateY(-2)

    return () => {
      root.remove(resources.pirateScene);
      root.remove(sky);
    }
  }, [resources])

  return [
    h('canvas', { ref: rendering.canvasRef, tabIndex: 0, className: classes.miniTheaterCanvas }),
    h(scene, { ref: rendering.sceneRef }, [
      h(perspectiveCamera, { ref: rendering.cameraRef }),
      h(BoardRenderer, { board, raycaster: sceneController.raycaster, onCursorOver, onCursorLeave }, [
        children,
        h(MiniTheaterCursorRenderer, { controller, resources }),
        miniTheaterView.characterPieces.map(c => {
          const character = characters.find(cha => cha.id === c.characterId);
          if (!character)
            return null;
          const asset = character.initiativeIconAssetId ? assets.get(character.initiativeIconAssetId) : null;
          return h(MiniTheaterPieceRenderer, {
            controller,
            position: c.position,
            pieceRef: { type: 'character', characterPieceId: c.id },
            textureURL: asset && asset.downloadURL,
          });
        }),
        miniTheaterView.monsterPieces.map(m => {
          const monster = monsterMasks.find(mm => mm.id === m.monsterActorId);
          if (!monster)
            return null;
          const asset = monster.initiativeIconAssetId ? assets.get(monster.initiativeIconAssetId) : null;
          return h(MiniTheaterPieceRenderer, {
            controller,
            position: m.position,
            pieceRef: { type: 'monster', monsterPieceId: m.id },
            textureURL: asset && asset.downloadURL,
          });
        }),
      ]),
    ])
  ]
}