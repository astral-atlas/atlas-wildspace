// @flow strict
/*::
import type { Board, Character, Vector3D, BoxBoardArea } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { ThreeCanvasScene } from "../../scenes/ThreeCanvasSceneProps";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { ambientLight, directionalLight, mesh, perspectiveCamera } from "@lukekaalim/act-three";
import { useLookAt } from "@lukekaalim/act-three/hooks";
import { useElementKeyboard } from "../../keyboard";
import { useKeyboardTrack } from "../../keyboard/track";
import { useBoardCameraControl } from "../../../docs/src/controls/finalDemo";
import {
  raycastManagerContext,
  useRaycast,
  useRaycastManager,
} from "../../raycast/manager";

import classes from './index.module.css';
import {
  BoxGeometry,
  Color,
  OrthographicCamera,
  Vector2,
  Vector3,
} from "three";
import { Encounter2, useEncounter } from "../../encounter/Encounter";
import { EncounterBoard } from "../../encounter/EncounterBoard";
import { EncounterBoardCharacterPiece } from "../../encounter/EncounterBoardCharacterPiece";
import { calculateBoardBox } from "@astral-atlas/wildspace-models";
import { resourcesContext, useResourcesLoader } from "../../encounter/useResources";
import { useSky } from "../../sky/useSky";

/*::
export type CharacterSheetMiniPreviewProps = {
  canvasRef?: Ref<?HTMLCanvasElement>,
  isFullscreen?: boolean,
  character: Character,
  assets: AssetDownloadURLMap
}
*/

export const CharacterSheetMiniPreview/*: Component<CharacterSheetMiniPreviewProps>*/ = ({
  canvasRef,
  isFullscreen,
  character,
  assets,
}) => {
  const cameraRef = useRef();
  const sceneRef = useRef();
  const localCanvasRef = useRef();

  useLookAt(cameraRef, new Vector3(5, 0, 5), []);

  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    camera.fov = isFullscreen ? 60 : 20;
    console.log(camera);
    camera.updateProjectionMatrix();
  }, [isFullscreen])

  const stateEmitter = useElementKeyboard(canvasRef || localCanvasRef, [], [])
  const track = useKeyboardTrack(stateEmitter);
  const raycast = useRaycastManager();

  const raycastEvents = {
    onPointerEnter: raycast.onMouseEnter,
    onPointerMove: raycast.onMouseMove,
    onPointerLeave: raycast.onMouseLeave,
    onClick: raycast.onClick,
  }

  const onLoop = () => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    raycast.onUpdate(camera);
  }

  const [piece, setPiece] = useState/*:: <{ pieceId: string, boardId: string, area: BoxBoardArea }>*/({
    pieceId: 'PIECE_A',
    boardId: 'BOARD_A',
    area: { type: 'box', position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
  });

  const [board, setBoard] = useState/*:: <Board>*/({
    id: 'BOARD_A',
    floors: [
      { type: 'box', box: {
        position: { x: 0, y: 0, z: 0 },
        size: { x: 3, y: 3, z: 1 },
      } },
    ],
  });

  const boardBox = calculateBoardBox(board);
  const resources = useResourcesLoader();

  const sky = useSky(8);
  useEffect(() => {
    const { current: rootScene } = sceneRef;
    if (!rootScene)
      return;
    
    rootScene.add(sky);
    sky.scale.setScalar( 450000 );
    return () => rootScene.remove(sky);
  }, [])

  const encounter = useEncounter({
    board,
    canvasRef: canvasRef || localCanvasRef,
    cameraRef,
    keyboard: track,

    pieces: [piece],
  })
  useEffect(() => {
    return encounter.subscribePieceMove(({ pieceId, position }) => {
      setPiece(p => ({ ...p, area: { ...p.area, position }}))
    })
  }, []);

  return [
    h(ThreeCanvasScene, {
      cameraRef,
      canvasRef,
      sceneRef,
      onLoop,
      canvasProps: { ...raycastEvents, class: classes.miniRenderer, tabIndex: 0 }
    }, h(raycastManagerContext.Provider, { value: raycast }, h(resourcesContext.Provider, { value: resources }, [
      h(ambientLight, { intensity: 0.8 }),
      h(directionalLight, {
        position: new Vector3(20, 100, 80),
        intensity: 0.4,
        castShadow: true,
        shadow: {
          camera: new OrthographicCamera(-32, 32, -32, 32, 0, 200),
          radis: 3,
          bias: -0.01,
          mapSize: new Vector2(256, 256)
        }
      }),
      h(EncounterBoard, { board, encounter }, [
        h(EncounterBoardCharacterPiece, { assets, character, piece, boardBox, encounter })
      ]),
      h(perspectiveCamera, { ref: cameraRef }),
    ]))),
  ];
}
