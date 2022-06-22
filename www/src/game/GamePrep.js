// @flow strict

import { EditorButton, GameMasterPrepLibrary, PlayerPrepLibrary } from "@astral-atlas/wildspace-components";
import { h, useEffect, useState } from "@lukekaalim/act";
import styles from './GamePage.module.css';

export const PrepMenu = ({ gameController }) => {
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