// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type {
  Encounter, EncounterState, Character,

  Exposition, Scene, RoomState,
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
import { useURLParam } from "../../www/hooks/navigation";
import { EncounterInitiativeTracker } from "../initiative/tracker";


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


const RoomSceneScreen = ({ scene, gameData, client }) => {
  return h(RoomScreen, {}, !!scene && h(SceneRenderer, { sceneId: scene.id, gameData, client }))
}
const RoomInitiativeScreen = ({ gameData, roomState }) => {
  return h(EncounterInitiativeTracker, {
    characters: gameData,
    assets: gameData.assets,
    encounter: {
      characters: [],
      minis: [],
    },
    encounterState: roomState.encounter,
    selectedMinis: [],
    miniImageURLMap: new Map(),
    gameMaster: true,
    onSelectedMinisChange: () => {},
  })
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

  const onSelectedSceneChange = async (sceneId) => {
    await client.room.scene.set(gameId, roomId, { activeScene: sceneId || null });
  }

  return h(RoomScreen, {}, [
    h(EditorForm, {}, [
      h(SelectEditor, {
        label: 'Scenes',
        values: [...gameData.scenes.map(e => ({ title: e.title, value: e.id })), { title: 'None', value: '' }],
        selected: roomState.scene.activeScene || '',
        onSelectedChange: onSelectedSceneChange
      }),
      h(AudioStateEditor, { client: client.room, gameData, roomData: roomState }),
    ]),
  ])
}
const RoomWikiScreen = ({ client, gameData }) => {
  return h(Wiki, {
    api: client,
    docs: gameData.wikiDocs,
    gameId: gameData.game.id,
    userId: gameData.userId,
    players: gameData.players,
  })
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
  const [directionParam, setDirectionParam] = useURLParam('direction');

  const sceneId = roomState.scene.activeScene;
  const scene = gameData.scenes.find(s => s.id === sceneId);

  const playerScreens = [
    { content: h(RoomSceneScreen, { scene, gameData, client }), icon: null, position: new Vector2(0, 0) },
    { content: h(RoomLobbyScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(0, 1) },
    { content: h(RoomWikiScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(1, 0) },
    //{ content: h(RoomInitiativeScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(-1, 0) },
  ]
  const gameMasterScreens = [
    ...playerScreens,
    { content: h(RoomAssetLibraryScreen, { client, gameData, gameId }), icon: null, position: new Vector2(-1, 1) },
    { content: h(RoomManagerScreen, { client, gameData, roomState, gameId, roomId, userId }), icon: null, position: new Vector2(-1, -1) },
  ];

  const screens = gameData.isGameMaster ? gameMasterScreens : playerScreens;

  const ref = useRef();
  const track = useKeyboardTrack(useElementKeyboard(ref))
  const emitter = useKeyboardTrackEmitter(track);

  const [direction, setDirection] = useCompassKeysDirection(emitter, screens, direction => {
    setDirectionParam(JSON.stringify([direction.x, direction.y], null, 0))
  }, new Vector2(...JSON.parse(directionParam || '[0, 0]')))

  return [
    h('div', { ref, style: { width: '100%', height: '100%', position: 'absolute' } }, [
      !!scene && h('div', { className: styles.background },
        h(SceneBackgroundRenderer, { gameData, scene, client, roomState })),
      h(CompassLayout, { screens, direction }),
    ])
  ]
};
