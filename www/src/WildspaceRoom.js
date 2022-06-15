// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { RoomID, GameID, Room, RoomPage, GamePage } from "@astral-atlas/wildspace-models";
import type { UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type { AppController } from "./App";
import type { AssetDownloadURLMap } from "@astral-atlas/wildspace-components";
*/

import { CompassLayout, EditorForm, EditorHorizontalSection, EditorVerticalSection, GameMasterPrepLibrary, SceneBackgroundRenderer, SelectEditor, ToolbarPalette, useCompassKeysDirection, useKeyboardTrack, useKeyboardTrackChanges, useMiniTheaterController, useSceneBackground } from "@astral-atlas/wildspace-components";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { Vector2 } from "three";
import { useGamePage, useUpdates } from "./WildspaceGame";
import styles from './WildspaceRoom.module.css';
import { WildspaceScene } from "./WildspaceScene";

const useRoomPage = (roomId, updates) => {
  const [roomPage, setRoomPage] = useState(null);
  useEffect(() => updates && updates.roomPage.subscribe(roomId, setRoomPage), [updates])
  return roomPage;
}
const useMiniTheater = (miniTheaterId, updates) => {
  const [miniTheater, setMiniTheater] = useState(null);
  useEffect(() => updates && miniTheaterId &&
    updates.miniTheater.subscribe(miniTheaterId, setMiniTheater) || null, [updates, miniTheaterId])
  return miniTheater;
}
const useLibrary = (isGM, updates) => {
  const [library, setLibrary] = useState(null);
  useEffect(() => updates && isGM &&
    updates.library.subscribe(setLibrary) || null, [updates, isGM])
  return library;
}

/*::
export type RoomAppPage =
  | { key: 'room', path: '/room', query: { gameId: GameID, roomId: RoomID }}

export type RoomController = {
  ...AppController,
  page: RoomAppPage,

  isGM: boolean,

  roomPage: RoomPage,
  gamePage: GamePage,
  updates: UpdatesConnection,
  assets: AssetDownloadURLMap,

  roomRef: Ref<?HTMLElement>,
}

export type WildspaceRoomProps = {
  page: RoomAppPage,
  appController: AppController,
  ref: (el: null | HTMLElement) => void,
};
*/


export const WildspaceRoom/*: Component<WildspaceRoomProps>*/ = ({ page, appController, ref }) => {
  const updates = useUpdates(appController.client, page.query.gameId);
  const gamePage = useGamePage(updates);
  const roomPage = useRoomPage(page.query.roomId, updates);

  useEffect(() => {
    if (roomPage && gamePage)
      appController.completeInitialLoad('room')
  }, [!!roomPage && !!gamePage])

  if (!gamePage || !roomPage || !updates)
    return null;

  const isGM = appController.userId === gamePage.game.gameMasterId;

  const assets = useMemo(() => gamePage && roomPage &&
    new Map([...gamePage.assets, ...roomPage.assets].map(a => [a.description.id, a])), [gamePage, roomPage]);
  const roomRef = useRef();
  
  const validDirections = [
    new Vector2(0, 0),
    new Vector2(1, 0),
    new Vector2(-1, 0),
    new Vector2(0, 1),
    new Vector2(0, -1),
    ...isGM ? [
      new Vector2(1, 1),
      new Vector2(1, -1),
      new Vector2(-1, 1),
      new Vector2(-1, -1),
    ] : [], 
  ]
  const [direction, setDirection, emitter] = useCompassKeysDirection(appController.emitter, validDirections);

  const roomController = {
    ...appController,
    isGM,
    emitter,
    updates,
    page,
    assets,
    gamePage,
    roomPage,
    roomRef,
  }

  const sceneRef = useRef();
  const backgroundRef = useRef();

  const playerScreens = [
    { content: h(WildspaceRoomScene, { ref: sceneRef, roomController, backgroundRef }), position: new Vector2(0, 0) },
    { content: 'Initiative', position: new Vector2(-1, 0) },
    { content: 'Wiki', position: new Vector2(1, 0) },
    { content: 'Lobby', position: new Vector2(0, 1) },
    { content: 'Toolbox', position: new Vector2(0, -1) },
  ]
  const gmScreens = [
    ...playerScreens,
    ...[
      { content: h(WildspaceRoomControls, { roomController }), position: new Vector2(-1, -1) },
      { content: h(WildspaceRoomLibrary, { roomController }), position: new Vector2(-1, 1) },
      { content: 'Something', position: new Vector2(1, -1) },
      { content: 'Something', position: new Vector2(1, 1) },
    ]
  ]
  const screens = isGM ? gmScreens : playerScreens;

  return [
    h('div', { ref, className: styles.room, ref: roomRef, tabIndex: 0 }, [
      h('div', { ref: backgroundRef, className: styles.backgroundScene }),
      h(CompassLayout, { screens, direction }),
    ])
  ];
}

const tools = [

];

const WildspaceRoomLibrary = ({ roomController }) => {
  const { gamePage, roomPage, client, updates, userId } = roomController;
  const { game } = gamePage;
  const [libraryData, setLibraryData] = useState(null);
  useEffect(() => updates.library.subscribe(setLibraryData), [updates]);

  return h('div', { className: styles.roomScreen },
    h('div', { className: styles.roomScreenPane },
      libraryData && h(GameMasterPrepLibrary, { client, data: libraryData, game, userId, })
    ));
}

const WildspaceRoomScene = ({ ref, roomController, backgroundRef }) => {
  
  return h('div', { ref, className: styles.roomScreen, tabIndex: 0 }, [
    h(WildspaceScene, { roomController, attachementRef: backgroundRef }),
  ])
}

const WildspaceRoomControls = ({ roomController }) => {
  const { gamePage, roomPage, client, updates } = roomController;
  const [libraryData, setLibraryData] = useState(null);
  useEffect(() => updates.library.subscribe(setLibraryData), [updates]);

  return h('div', { className: styles.roomScreen },
    h('div', { className: styles.roomScreenPane } ,
      libraryData && h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(EditorVerticalSection, {}, [
            h(SelectEditor, {
              label: 'Active Scene',
              values: [
                ...libraryData.scenes.map(s => ({ value: s.id, title: s.title })),
                { value: '', title: 'None' }
              ],
              selected: roomPage.scene && roomPage.scene.id || '',
              onSelectedChange: async sceneId => {
                client.room.scene.set(gamePage.game.id, roomPage.room.id, { activeScene: sceneId || null })
              }
            })
          ]),
          h(EditorVerticalSection, {}, [
            h('div',{}, 'hello')
          ]),
        ])
      ])))
}