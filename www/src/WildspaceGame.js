// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type { GameID, Game, GamePage, RoomID } from "@astral-atlas/wildspace-models";
import type { KeyboardStateEmitter } from "@astral-atlas/wildspace-components";
import type { Navigation } from "@lukekaalim/act-navigation";
import type { UserID, } from "@astral-atlas/sesame-models";

import type { AppController } from "./App";
*/
import { h, useEffect, useState } from "@lukekaalim/act";
import { CompassLayout, CornersLayout, EditorButton, GameMasterPrepLibrary, IllusionSelect, PlayerPrepLibrary, SelectEditor, useAnimatedKeyedList, useRefMap, useRenderSetup, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";
import { HomepageRoomSelector } from "../../components/navigation";
import { useURLParam } from "../hooks/navigation";
import { Color, Vector2 } from "three";
import { perspectiveCamera, scene } from "@lukekaalim/act-three";
import { v4 as uuid } from 'uuid';

import styles from './WildspaceGame.module.css';
import { WildspaceRoom } from "./WildspaceRoom";
import { createInitialCubicBezierAnimation, interpolateCubicBezierAnimation, maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";

export const useUpdates = (client/*: WildspaceClient*/, gameId/*: GameID*/)/*: ?UpdatesConnection*/ => {
  const [updates, setUpdates] = useState(null)
  useEffect(() => {
    const updatePromise = client.updates.create(gameId);
    updatePromise.then(setUpdates)
    return () => {
      updatePromise.then(updates => updates.updates.close());
    }
  }, [client, gameId])

  return updates;
}

export const useGamePage = (updates/*: ?UpdatesConnection*/)/*: ?GamePage*/ => {
  const [gamePage, setGamePage] = useState(null);

  useEffect(() => updates && updates.gamePage.subscribe(setGamePage), [updates])

  return gamePage;
}

/*::
export type GameScreenType = 'main' | 'prep';
export type GameController = {
  ...AppController,

  games: $ReadOnlyArray<Game>,
  gamePage: GamePage,
  setSelectedGame: GameID => void,

  setPageToRoom: RoomID => void,
  
  updates: UpdatesConnection,
};

export type GameAppPage =
  | { key: 'game', path: '/', query: { gameId: ?GameID } }
  | { key: 'game', path: '/prep', query: { gameId: GameID } }
*/

/*::
export type WildspaceGameProps = {
  page: GameAppPage,
  appController: AppController,
  ref: (el: null | HTMLElement) => void,
};
*/
export const WildspaceGame/*: Component<WildspaceGameProps>*/ = ({
  page,
  appController,
  ref,
}) => {
  const [games, setGames] = useState(null);
  useEffect(() => {
    appController.client.game.list()
      .then(setGames)
  }, [])

  if (!games || games.length < 1)
    return null;

  const selectedGame = games.find(game => game.id === page.query.gameId) || games[0];

  const directions = new Map([
    ['/', new Vector2(0, 0)],
    ['/prep', new Vector2(1, 0)],
  ])
  const direction = directions.get(appController.page.path) || new Vector2();

  const updates = useUpdates(appController.client, selectedGame.id)
  const gamePage = useGamePage(updates);

  const setSelectedGame = (gameId) => {
    appController.setPage({ key: 'game', path: '/', query: { gameId }})
  }

  const gameController = gamePage && updates && {
    ...appController,

    games,
    gamePage,
    setSelectedGame,

    updates,
  }
  useEffect(() => {
    if (gameController)
      appController.completeInitialLoad('game');
  }, [!!gameController])

  const render = useRenderSetup()

  return h('div', { ref, className: styles.transitionContainer  }, [
    h('canvas', { ref: render.canvasRef, className: styles.menuCanvas }),
    h(scene, { ref: render.sceneRef }, [
      h(WildspaceStarfieldScene),
      h(perspectiveCamera, { ref: render.cameraRef })
    ]),
    !!gameController && [
      h(CompassLayout, { direction, screens: [
        {
          position: new Vector2(1, 0),
          content: h(WildspacePrepMenu, {
            gameController,
          })
        },
        {
          position: new Vector2(0, 0),
          content: h(WildspaceGameMenu, {
            gameController,
          })
        },
      ] }),
    ],
  ]);
}

const WildspaceGameMenu = ({
  gameController,
}) => {
  
  return [
    h('menu', {}, [
      h('li', {}, h(SelectEditor, {
        values: gameController.games.map(g => ({ value: g.id, title: g.name })),
        selected: gameController.gamePage.game.id,
        onSelectionChange: gameController.setSelectedGame
      })),
      h('li', {}, h(EditorButton, {
        label: 'Player Preparation',
        onButtonClick: () => gameController.setPage({
          key: 'game',
          path: '/prep',
          query: { gameId: gameController.gamePage.game.id }
        }),
      })),
      gameController.gamePage.rooms.map(room =>
        h('li', {},
          h('button', {
            onClick: () => gameController.setPage({
              key: 'room',
              path: '/room',
              query: { gameId: gameController.gamePage.game.id, roomId: room.id }
            }) },
          room.title)))
    ])
  ]
}

const WildspacePrepMenu = ({ gameController }) => {
  const { gamePage: { game }, userId } = gameController;

  const isGM = userId === game.gameMasterId;
  const libraryElement = isGM
    ? h(WildspaceGMPrepMenu, { gameController })
    : h(WildspacePlayerPrepMenu, { gameController })

  return h('div', { className: styles.menuPrepScreen },
    h('div', { className: styles.menuPrep }, libraryElement))
};

const WildspacePlayerPrepMenu = ({ gameController}) => {
  const { client, userId, gamePage } = gameController;
  const { characters, assets, game, rooms } = gamePage;
  const assetMap = new Map(assets.map(a => [a.description.id, a]))
  
  return h(PlayerPrepLibrary, { assets: assetMap, characters, client, game, userId, catalogueHeader: [
    h(EditorButton, { label: 'Back', onButtonClick: () => gameController.setPage({
      key: 'game',
      path: '/',
      query: { gameId: gameController.gamePage.game.id }
    }) })
  ] })
}

const WildspaceGMPrepMenu = ({ gameController }) => {
  const { client, userId, updates, gamePage } = gameController;
  const { game } = gamePage;
  const [library, setLibrary] = useState(null)
  useEffect(() => {
    return updates.library.subscribe(setLibrary)
  }, [updates])

  return library && h(GameMasterPrepLibrary, { data: library, client, game, updates, userId, catalogueHeader: [
    h(EditorButton, { label: 'Back', onButtonClick: () => gameController.setPage({
      key: 'game',
      path: '/',
      query: { gameId: gameController.gamePage.game.id }
    }) })
  ] })
}