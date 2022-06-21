// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Navigation } from "@lukekaalim/act-navigation";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type { GameID, Game, GamePage, RoomID } from "@astral-atlas/wildspace-models";
import type { WildspaceController, GameRoute } from "@astral-atlas/wildspace-components";
import type { UserID } from "@astral-atlas/sesame-models";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
*/

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import {
  CompassLayout, EditorButton, EditorRangeInput, GameMasterPrepLibrary,
  LosersFollyScene,
  MenuGameBreak,
  MenuGameButton,
  MenuGameColumn,
  MenuGameDescriptor,
  MenuGameIdEditor,
  MenuGamePrepButton,
  MenuGameRoomButton,
  PlayerPrepLibrary, SelectEditor, useRenderSetup,
  WildspaceStarfieldScene
} from "@astral-atlas/wildspace-components";

import { Color, Vector2, Euler, Vector3 } from "three";
import { perspectiveCamera, scene } from "@lukekaalim/act-three";

import styles from './WildspaceGame.module.css';
import { maxSpan, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve/bezier";
import { GameMenu } from "./game/GameMenu";

export const useUpdates = (client/*: WildspaceClient*/, gameId/*: ?GameID*/)/*: ?UpdatesConnection*/ => {
  const [updates, setUpdates] = useState(null)
  useEffect(() => {
    if (!gameId)
      return;
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
  ...WildspaceController,

  userId: UserID,
  games: $ReadOnlyArray<Game>,
  gamePage: GamePage,
  selectedGame: Game,
  updates: UpdatesConnection,
};
*/

export const useGameController = (
  route/*: GameRoute*/,
  wildspace/*: WildspaceController*/,
  userId/*: UserID*/,
)/*: ?GameController*/ => {
  const [games, setGames] = useState(null);
  useEffect(() => {
    wildspace.client.game.list()
      .then(setGames)
  }, [wildspace])

  const selectedGame = games && (games.find(game => game.id === route.gameId) || games[0]);

  const updates = useUpdates(wildspace.client, selectedGame && selectedGame.id || null)
  const gamePage = useGamePage(updates);

  return updates && games && gamePage && selectedGame && {
    ...wildspace,
    updates,
    userId,
    
    gamePage,
    selectedGame,
    games,
  }
};

/*::
export type WildspaceGameProps = {
  userId: UserID,
  loadingAnim: CubicBezierAnimation,
  route: GameRoute,
  wildspace: WildspaceController,
};
*/
export const WildspaceGame/*: Component<WildspaceGameProps>*/ = ({
  userId,
  route,
  loadingAnim,
  wildspace
}) => {
  const ref = useRef();
  const gameController = useGameController(route, wildspace, userId);
  const directions = {
    '/': new Vector2(0, 0),
    '/prep': new Vector2(1, 0),
  };
  const direction = directions[route.path];

  const render = useRenderSetup()
  const [gameLoadingAnim] = useAnimatedNumber(!!gameController ? 1 : 0, 0, { impulse: 3, duration: 1000 });

  useTimeSpan(maxSpan([loadingAnim.span, gameLoadingAnim.span]), (now) => {
    const { current: div } = ref;
    if (!div)
      return;
    const gamePoint = calculateCubicBezierAnimationPoint(gameLoadingAnim, now);
    const appPoint = calculateCubicBezierAnimationPoint(loadingAnim, now);

    const max = Math.min(gamePoint.position, appPoint.position);
    div.style.opacity = max;
  }, [loadingAnim, gameLoadingAnim]);


  return h('div', { ref, className: styles.transitionContainer  }, [
    h('canvas', { ref: render.canvasRef, className: styles.menuCanvas }),
    h(scene, { ref: render.sceneRef, background: new Color('black') }, [
      h(WildspaceStarfieldScene),
      h(perspectiveCamera, { ref: render.cameraRef })
    ]),
    !!gameController && [
      h(CompassLayout, { direction, screens: [
        {
          position: new Vector2(1, 0),
          content: h(WildspacePrepMenu, { gameController })
        },
        {
          position: new Vector2(0, 0),
          content: h(GameMenu, { gameController })
        },
      ] }),
    ],
  ]);
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
    h(EditorButton, { label: 'Back', onButtonClick: () => gameController.router.setRoute({
      page: 'game',
      path: '/',
      gameId: gameController.gamePage.game.id,
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
    h(EditorButton, { label: 'Back', onButtonClick: () => gameController.router.setRoute({
      page: 'game',
      path: '/',
      gameId: gameController.gamePage.game.id
    }) })
  ] })
}