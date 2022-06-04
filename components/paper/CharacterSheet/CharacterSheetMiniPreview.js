// @flow strict
/*::
import type { Board, Character, Vector3D, BoxBoardArea } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { AssetDownloadURLMap } from "../../asset/map";
*/
import { ThreeCanvasScene } from "../../scenes/ThreeCanvasSceneProps";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { ambientLight, directionalLight, mesh, perspectiveCamera, scene } from "@lukekaalim/act-three";
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
  Box2,
  BoxGeometry,
  Color,
  OrthographicCamera,
  Vector2,
  Vector3,
} from "three";
import {
  useEncounter,
  useEncounterController,
} from "../../encounter/Encounter";
import { EncounterBoard } from "../../encounter/EncounterBoard";
import { EncounterBoardCharacterPiece } from "../../encounter/EncounterBoardCharacterPiece";
import { calculateBoardBox } from "@astral-atlas/wildspace-models";
import { resourcesContext, useResourcesLoader } from "../../encounter/useResources";
import { useSky } from "../../sky/useSky";
import { useRenderSetup } from "../../three";

/*::
export type CharacterSheetMiniPreviewProps = {
  canvasRef?: Ref<?HTMLCanvasElement>,
  isFullscreen?: boolean,
  character: Character,
  assets: AssetDownloadURLMap
}
*/

const previewBoard = {
  id: 'PREVIEW_BOARD',
  floors: [
    { type: 'box', box: { position: { x: 0, y: 0, z: 0 }, size: { x: 3, y: 3, z: 1} } },
  ]
}

export const CharacterSheetMiniPreview/*: Component<CharacterSheetMiniPreviewProps>*/ = ({
  canvasRef,
  isFullscreen,
  character,
  assets,
}) => {
  const renderSetup = useRenderSetup({ canvasRef });
  const cameraBounds = new Box2(
    new Vector2(0, -30),
    new Vector2(30, 0),
  );
  const boards = [
    previewBoard
  ];
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0, z: 0 });
  const characterPiece = {
    id: character.id,
    boardId: previewBoard.id,
    area: { type: 'box', box: { position: characterPosition, size: { x: 1, y: 1, z: 1 } } },
  }
  const pieces = [
    characterPiece
  ]
  const keyboardEmitter = useElementKeyboard(renderSetup.canvasRef);
  const keyboard = useKeyboardTrack(keyboardEmitter);

  const controller = useEncounterController({
    ...renderSetup,
    boards,
    pieces,
    keyboard,
    cameraBounds
  })
  const boardBox = calculateBoardBox(previewBoard);
  useEffect(() => {
    return controller.subscribePieceMove(event => {
      setCharacterPosition(event.position)
    })
  }, [controller])

  const resources = useResourcesLoader();

  const sky = useSky(8);
  useEffect(() => {
    const { current: rootScene } = renderSetup.sceneRef;
    if (!rootScene)
      return;
    
    rootScene.add(sky);
    sky.scale.setScalar( 450000 );
    return () => rootScene.remove(sky);
  }, [])


  useEffect(() => {
    const { current: root } = renderSetup.sceneRef;
    if (!root)
      return;

    const boardPositionToLocalVector = (position/*: Vector3D*/, boardBox)/*: Vector3*/ => {
      return new Vector3(
        (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
        (position.z * 10),
        (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
      )
    }
    root.add(resources.floatingScene);
    resources.floatingScene.position.copy(boardPositionToLocalVector({ x: 0, y: 0, z: 0 }, boardBox))
    resources.floatingScene.translateY(-2)
    return () => {
      root.remove(resources.floatingScene)
    }
  }, [resources])

  useEffect(() => {
    const { current: camera } = renderSetup.cameraRef;
    if (!camera)
      return;
    camera.fov = 30;
    camera.updateProjectionMatrix();
  }, [])

  return [
    h('canvas', { ref: renderSetup.canvasRef, className: classes.miniRenderer, tabIndex: 0 }),
    h(scene, { ref: renderSetup.sceneRef }, [
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
      h(EncounterBoard, { board: previewBoard, encounter: controller, resources }, pieces.map(piece =>
        h(EncounterBoardCharacterPiece, { assets, character, piece, boardBox, encounter: controller })
      )),
      h(perspectiveCamera, { ref: renderSetup.cameraRef, fov: 30 }),
    ]),
  ];
}
