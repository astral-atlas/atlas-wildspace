// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Encounter, EncounterState, Character, GameID, RoomID } from "@astral-atlas/wildspace-models";
import type { EncounterLocalState } from "../encounter/Encounter";
import type { AssetDownloadURLMap } from "../asset/map";
*/
import { ThreeCanvasScene } from "../scenes/ThreeCanvasSceneProps";
import { useKeyboardTrack } from "../keyboard/track";
import { EncounterBoardCharacterPiece, EncounterBoardPiece } from "../encounter";
import { useSky } from "../sky/useSky";
import { useRaycastManager } from "../raycast/manager";
import {
  Box2,
  OrthographicCamera,
  Vector2,
  Vector3,
  PCFSoftShadowMap,
  CameraHelper,
  Color,
} from "three";


import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { useEncounter } from "../encounter/Encounter";
import { EncounterBoard } from "../encounter/EncounterBoard";
import { useElementKeyboard } from "../keyboard";
import { resourcesContext, useResourcesLoader } from "../encounter/useResources";
import { raycastManagerContext } from "../raycast";
import { ambientLight, directionalLight, group, orthographicCamera, perspectiveCamera, scene, useAnimationFrame } from "@lukekaalim/act-three";

import classes from './EncounterSceneRenderer.module.css';
import { calculateBoardBox } from "@astral-atlas/wildspace-models";
import { useRenderSetup } from "../three/useRenderSetup";
import { EditorRangeInput } from "../editor/range";

const HARDCODED_BOARD = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: {
      position: { x: 1, y: 0, z: 0 },
      size: { x: 30, y: 24, z: 1 }
    } }
  ]
};

const boardBox = calculateBoardBox(HARDCODED_BOARD);

/*::

export type EncounterSceneRendererProps = {
  gameId: GameID,
  roomId: RoomID,
  client: WildspaceClient,
  assets: AssetDownloadURLMap,
  characters: $ReadOnlyArray<Character>,
  encounterState: EncounterState,
};
*/
const boardPositionToLocalVector = (position) => {
  return new Vector3(
    (position.x + 0.5 + Math.floor(boardBox.size.x/2)) * 10,
    (position.z * 10),
    (position.y + 0.5 + Math.floor(boardBox.size.y/2)) * 10,
  )
}

export const EncounterSceneRenderer/*: Component<EncounterSceneRendererProps>*/ = ({
  gameId,
  roomId,
  assets,
  characters,
  encounterState,
  client
}) => {
  const renderSetup = useRenderSetup({}, ({ renderer }) => {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  });
  
  const board = HARDCODED_BOARD;
  const miniPieces = new Map(encounterState.minis.map(mini => [
    mini.id,
    {
      boardId: board.id,
      id: mini.id,
      area: { type: 'box', box: { 
        position: mini.position,
        size: { x: 1, y: 1, z: 1 }
      } }
    }
  ]));
  const pieces = [
    ...miniPieces.values(),
  ];
  const boards = [
    board,
  ]
  const cameraBounds = new Box2(
    new Vector2(0, -300),
    new Vector2(300, 0)
  )

  const encounterController = useEncounter({ ...renderSetup, boards, pieces, cameraBounds });
  useEffect(() => {
    return encounterController.subscribePieceMove(async (event) => {
      await client.room.performEncounterActions(gameId, roomId, [
        { type: 'move', miniId: event.pieceId, newPosition: event.position }
      ]);
    });
  }, [])

  const canvasProps = {
    ref: renderSetup.canvasRef,
    tabIndex: 0,
    class: classes.encounterSceneCanvas
  };
  const [elevation, setElevation] = useState(0);
  const [azimuth, setAzimuth] = useState(220);

  const resources = useResourcesLoader()
  const sky = useSky(elevation, azimuth);
  const lightRef = useRef();
  const lightTargetRef = useRef();

  useEffect(() => {
    const { current: root } = renderSetup.sceneRef;
    const { current: light } = lightRef;
    const { current: lightTarget } = lightTargetRef;
    
    if (!root || !light || !lightTarget)
      return;

    const cameraHelper = new CameraHelper(light.shadow.camera)
    cameraHelper.matrixAutoUpdate = false;
    light.target = lightTarget;

    root.add(sky);
    root.add(cameraHelper);
    root.add(resources.pirateScene);

    sky.scale.setScalar( 4500 );
    resources.pirateScene.position.copy(boardPositionToLocalVector({ x: 1, y: -1, z: 0 }).add(new Vector3(0, 0, 5)))
    resources.pirateScene.translateY(-2)

    return () => {
      root.remove(resources.pirateScene);
      root.remove(cameraHelper);
      root.remove(sky);
    }
  }, [resources])

  const [bias, setBias] = useState(-0.005);

  const lightRootRef = useRef(null);

  useAnimationFrame(() => {
    const { current: lightRoot } = lightRootRef;
    if (!lightRoot)
      return;

    lightRoot.rotateOnAxis(new Vector3(1, 0, 0), 0.01);
  }, []);

  return [
    h('canvas', canvasProps),
    h(scene, { ref: renderSetup.sceneRef }, [
      h(ambientLight, { intensity: 0.2, color: new Color('orange') }),
      h(group, { ref: lightRootRef }, [
        h(directionalLight, {
          ref: lightRef,
          position: boardPositionToLocalVector({ x: 0, y: 0, z: 0 })
            .add(new Vector3(-60, 100, -60)),
          intensity: 0.8,
          castShadow: true,
          shadow: {
            camera: new OrthographicCamera(-256, 256, -256, 256, 0, 500),
            radis: 3,
            bias,
            mapSize: new Vector2(2048, 2048)
          }
        }),
      ]),
      h(group, {
        ref: lightTargetRef,
        position: boardPositionToLocalVector({ x: 0, y: 0, z: 0 })
      }),
      h(perspectiveCamera, { ref: renderSetup.cameraRef }),
      h(EncounterBoard, { board, encounter: encounterController, resources }, [
        encounterState.minis.map(mini => {
          const piece = miniPieces.get(mini.id);
          if (!piece)
            return null;
  
          switch (mini.type) {
            case 'character':
              const character = characters.find(c => c.id === mini.characterId);
              if (!character)
                return null;
  
              return h(EncounterBoardCharacterPiece, { piece, assets, character, encounter: encounterController });
            default:
              return null;
          }
        })
      ])
    ])
  ];
}

const getImageAssetId = (mini, characters) => {
  switch (mini.type) {
    case 'character':
      const character =  characters.find(c => c.id === mini.characterId)
      if (!character)
        return null;
      return character.initiativeIconAssetId;
    case 'monster':
      return mini.iconAssetId;

  }
}