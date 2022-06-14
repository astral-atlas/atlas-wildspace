// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameID, Game } from "@astral-atlas/wildspace-models";
import type { Navigation } from "@lukekaalim/act-navigation";
import type { UserID } from "@astral-atlas/sesame-models";
*/
import { h, useEffect, useState } from "@lukekaalim/act";
import { CompassLayout, CornersLayout, EditorButton, IllusionSelect, PlayerPrepLibrary, SelectEditor, useRenderSetup, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";
import { HomepageRoomSelector } from "../../components/navigation";
import { useURLParam } from "../hooks/navigation";
import { Color, Vector2 } from "three";
import { perspectiveCamera, scene } from "@lukekaalim/act-three";

import styles from './WildspaceGame.module.css';
import { WildspaceRoom } from "./WildspaceRoom";

const useUpdates = (client, gameId) => {
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

const useGamePage = (updates) => {
  const [gamePage, setGamePage] = useState(null);

  useEffect(() => updates && updates.gamePage.subscribe(setGamePage), [updates])

  return gamePage;
}

/*::
export type WildspaceGameProps = {
  client: WildspaceClient,
  userId: UserID,
  navigation: Navigation,
  games: $ReadOnlyArray<Game>,
};
*/
export const WildspaceGame/*: Component<WildspaceGameProps>*/ = ({
  client,
  userId,
  navigation,
  games,
}) => {
  const render = useRenderSetup()
  const [manualGameId, setManualGameId] = useURLParam("gameId", navigation)
  const [roomId, setRoomId] = useURLParam("roomId", navigation);

  if (games.length < 1)
    return null;

  const selectedGame = games.find(game => game.id === manualGameId) || games[0];

  const onSelectedGameIdChange = (gameId) => {
    setManualGameId(gameId);
  }
  const [screen, setScreen] = useState('main');
  const onScreenSelect = (screen) => {
    setScreen(screen);
  }
  const onEnterRoom = (roomId) => () => {
    setRoomId(roomId)
  }
  const directions = {
    'main': new Vector2(0, 0),
    'prep': new Vector2(1, 0),
  }
  const direction = directions[screen];

  const updates = useUpdates(client, selectedGame.id)
  const gamePage = useGamePage(updates);

  if (roomId)
    return h(WildspaceRoom, { gamePage, updates, client, roomId });

  return [
    h('canvas', { ref: render.canvasRef, className: styles.menuCanvas }),
    h(scene, { ref: render.sceneRef }, [
      h(WildspaceStarfieldScene),
      h(perspectiveCamera, { ref: render.cameraRef })
    ]),
    gamePage && [
      h(CompassLayout, { direction, screens: [
        { position: new Vector2(0, 0), content: h(WildspaceGameMenu, {
          selectedGame, games, userId, updates,
          onSelectedGameIdChange,
          onEnterRoom,
          onScreenSelect, gamePage,
        }) },
        { position: new Vector2(1, 0), content: h(WildspacePrepMenu, {
          userId, client, updates, selectedGame,
          onScreenSelect, gamePage
        }) },
      ] }),
    ],
  ];
}

const WildspaceGameMenu = ({
  selectedGame, games, userId,
  onSelectedGameIdChange,
  onScreenSelect, onEnterRoom,
  gamePage,
}) => {
  return [
    h('menu', {}, [
      h('li', {}, h(SelectEditor, {
        values: games.map(g => ({ value: g.id })),
        selected: selectedGame.id,
        onSelectionChange: onSelectedGameIdChange
      })),
      h('li', {}, h(EditorButton, {
        label: 'Player Preparation',
        onButtonClick: () => onScreenSelect('prep')
      })),
      !!selectedGame.gameMasterId === userId && h('li', {}, h(EditorButton, {
        label: 'Game Master Preparation',
        onButtonClick: () => onScreenSelect('prep')
      })),
      gamePage.rooms.map(room =>
        h('li', {}, h('button', { onClick: onEnterRoom(room.id) }, room.title)))
    ])
  ]
}

const WildspacePrepMenu = ({ client, userId, selectedGame, updates, onScreenSelect, gamePage }) => {
  const { characters, assets, game, rooms } = gamePage;
  const assetMap = new Map(assets.map(a => [a.description.id, a]))

  return h('div', { className: styles.menuPrepScreen },
    h('div', { className: styles.menuPrep },
      h(PlayerPrepLibrary, { assets: assetMap, characters, client, game, userId, catalogueHeader: [
        h(EditorButton, { label: 'Back', onButtonClick: () => onScreenSelect('main') })
      ] })))
};