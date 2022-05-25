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
import { EncounterBoardPiece } from "../encounter";
import { useSky } from "../sky/useSky";
import { useRaycastManager } from "../raycast/manager";
import { OrthographicCamera, Vector2, Vector3 } from "three";


import { h, useEffect, useRef } from "@lukekaalim/act";
import { useEncounter } from "../encounter/Encounter";
import { EncounterBoard } from "../encounter/EncounterBoard";
import { useElementKeyboard } from "../keyboard";
import { resourcesContext, useResourcesLoader } from "../encounter/useResources";
import { raycastManagerContext } from "../raycast";
import { ambientLight, directionalLight, perspectiveCamera } from "@lukekaalim/act-three";

import classes from './EncounterSceneRenderer.module.css';
import { calculateBoardBox } from "@astral-atlas/wildspace-models";

const HARDCODED_BOARD = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: {
      position: { x: 1, y: 0, z: 0 },
      size: { x: 30, y: 25, z: 1 }
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
  const sceneRef = useRef();
  const cameraRef = useRef();
  const canvasRef = useRef();

  const kse = useElementKeyboard(canvasRef);
  const keyboard = useKeyboardTrack(kse);

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
  
  const board = HARDCODED_BOARD;
  const pieces = encounterState.minis.map(mini => ({
    boardId: board.id,
    pieceId: mini.id,
    area: { position: mini.position, size: { x: 1, y: 1, z: 1 }}
  }))

  const encounterLocalState = useEncounter({ canvasRef, cameraRef, board, keyboard, pieces });
  useEffect(() => {
    return encounterLocalState.subscribePieceMove(async (event) => {
      await client.room.performEncounterActions(gameId, roomId, [
        { type: 'move', miniId: event.pieceId, newPosition: event.position }
      ]);
    });
  }, [])

  const canvasProps = {
    ...raycastEvents,
    tabIndex: 0,
    class: classes.encounterSceneCanvas
  };

  const resource = useResourcesLoader()

  const sky = useSky(10, 180);
  useEffect(() => {
    const { current: currentScene } = sceneRef;
    if (!currentScene)
      return;
    currentScene.add(sky);
    sky.scale.setScalar( 450000 );
    return () => currentScene.remove(sky);
  }, [])

  useEffect(() => {
    const { current: root } = sceneRef;
    if (!root)
      return;

    root.add(resource.pirateScene);
    resource.pirateScene.position.copy(boardPositionToLocalVector({ x: 0, y: 0, z: 0 }).add(new Vector3(0, 0, 5)))
    resource.pirateScene.translateY(-2)
    return () => {
      root.remove(resource.pirateScene)
    }
  }, [resource])


  return h(ThreeCanvasScene, { onLoop, cameraRef, canvasRef, sceneRef, canvasProps }, [
    h(ambientLight, { intensity: 0.8 }),
    h(directionalLight, {
      position: new Vector3(20, 100, 80),
      intensity: 0.4,
      castShadow: true,
      shadow: {
        camera: new OrthographicCamera(-512, 512, -512, 512, 0, 200),
        radis: 3,
        bias: -0.04,
        mapSize: new Vector2(512, 512)
      }
    }),
    h(perspectiveCamera, { ref: cameraRef }),
    h(resourcesContext.Provider, { value: resource }, [
      h(raycastManagerContext.Provider, { value: raycast }, [
        h(EncounterBoard, { board, encounter: encounterLocalState }, [
          encounterState.minis.map(mini => {
            const piece = pieces.find(p => p.pieceId === mini.id);
            if (!piece)
              return null
            const assetId = getImageAssetId(mini, characters)
            const asset = assetId && assets.get(assetId);
            const textureURL = asset && asset.downloadURL;
      
            return h(EncounterBoardPiece, { piece, boardId: board.id, encounter: encounterLocalState, textureURL, boardBox })
          })
        ]),
      ]),
    ])
  ])
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