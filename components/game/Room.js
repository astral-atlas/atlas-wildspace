// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type {
  Encounter, EncounterState, Character,

  ExpositionScene, RoomState,
  RoomID, GameID,
} from "@astral-atlas/wildspace-models";
*/

import { h, useMemo, useRef } from "@lukekaalim/act";
import {
  CompassLayout,
  CompassLayoutMinimap,
  useCompassKeysDirection,
} from "../layout/CompassLayout";
import { Vector2 } from "three";
import { useKeyboardTrack, useKeyboardTrackEmitter } from "../keyboard/track";
import { useElementKeyboard } from "../keyboard";
import { AssetLibrary } from "../asset";
import { Lobby } from "./Lobby";
import { SceneRenderer, SceneBackgroundRenderer } from "../scene/SceneRenderer";
import { EditorForm, SelectEditor } from "../editor/form";
import styles from './Room.module.css';
import { RoomAudioPlayer } from "../audio";
import { AudioStateEditor } from "./audio.js";
import { Wiki } from "./Wiki.js";


/*::
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameData } from "./data";
import type { UserID } from "@astral-atlas/sesame-models";
*/

const style = {
  width: '100%',
  height: '100%',
}

const RoomScreen = ({ children }) => {
  return h('div', { style, className: styles.screen }, children);
}


const RoomSceneScreen = ({ scene, gameData }) => {
  
  return h(RoomScreen, {}, !!scene && h(SceneRenderer, { scene, gameData }))
}
const RoomLobbyScreen = ({ client, roomState, gameData, userId, gameId, roomId }) => {
  const onMessageSubmit = async (content) => {
    client.room.lobby.postMessage(gameId, roomId, content)
  }
  return h(RoomScreen, {}, h(Lobby, {
    characters: [],
    messages: roomState.lobby.messages,
    userId,
    onMessageSubmit,
    connections: roomState.lobby.playersConnected,
    players: gameData.players,
  }))
}
const RoomAssetLibraryScreen = ({ client, gameData, gameId }) => {
  return h(RoomScreen, {}, h(AssetLibrary, { client, data: gameData, gameId }))
}
const RoomManagerScreen = ({ client, gameData, roomState, roomId, gameId }) => {

  const onSelectedSceneChange = async (expositionSceneId) => {
    await client.room.scene.setActiveScene(gameId, roomId, { type: 'exposition', ref: expositionSceneId });
  }

  return h(RoomScreen, {}, [
    h(EditorForm, {}, [
      h(SelectEditor, {
        values: [...gameData.scenes.exposition.map(e => ({ title: e.title, value: e.id })), { title: 'None', value: '' }],
        selected: roomState.scene.activeScene && roomState.scene.activeScene.type === 'exposition' ? roomState.scene.activeScene.ref : '',
        onSelectedChange: onSelectedSceneChange
      }),
      h(AudioStateEditor, { client: client.room, gameData, roomData: roomState }),
    ]),
  ])
}
const RoomWikiScreen = ({ client, gameData }) => {
  return h(Wiki, { api: client, docs: gameData.wikiDocs, gameId: gameData.game.id, userId: gameData.userId })
}

/*::
export type RoomProps = {
  gameData: GameData,
  roomState: RoomState,
  client: WildspaceClient,
  gameId: GameID,
  roomId: RoomID,
  userId: UserID,
};
*/

export const Room/*: Component<RoomProps>*/ = ({ client, gameData, roomState, userId, roomId, gameId }) => {
  const sceneRef = roomState.scene.activeScene;
  const scene = sceneRef && sceneRef.type === 'exposition' && gameData.scenes.exposition.find(e => e.id === sceneRef.ref);

  const gameMasterScreens = [
    { content: h(RoomSceneScreen, { scene, gameData }), icon: null, position: new Vector2(0, 0) },
    { content: h(RoomAssetLibraryScreen, { client, gameData, gameId }), icon: null, position: new Vector2(-1, 1) },
    { content: h(RoomLobbyScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(0, 1) },
    { content: h(RoomManagerScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(-1, -1) },
    { content: h(RoomWikiScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(1, 0) },
  ];
  const playerScreens = [
    { content: h(RoomSceneScreen, { scene, gameData }), icon: null, position: new Vector2(0, 0) },
    { content: h(RoomLobbyScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(0, 1) },
    { content: h(RoomWikiScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(1, 0) },
  ]

  const screens = gameData.isGameMaster ? gameMasterScreens : playerScreens

  const ref = useRef();
  const track = useKeyboardTrack(useElementKeyboard(ref))
  const emitter = useKeyboardTrackEmitter(track);

  const [direction, setDirection] = useCompassKeysDirection(emitter, screens)

  return [
    h('div', { ref, style: { width: '100%', height: '100%', position: 'absolute' } }, [
      !!scene && h('div', { className: styles.background },
        h(SceneBackgroundRenderer, { gameData, scene })),
      h(CompassLayout, { screens, direction }),
    ])
  ]
};
