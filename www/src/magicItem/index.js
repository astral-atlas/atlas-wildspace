// @flow strict

import { MagicItemCard, useAsync, useGameData, useGameUpdateTimes, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";
import { h, useRef } from "@lukekaalim/act";

/*::
import type { Component } from "@lukekaalim/act/component";
*/
import { useURLParam } from "../../hooks/navigation";
import { useAPI } from "../../hooks/api";
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";
import styles from './index.module.css';
import { FullscreenCanvasScene } from "../home";
import { perspectiveCamera } from "@lukekaalim/act-three";

export const MagicItemPage/*: Component<>*/ = () => {
  const [gameId] = useURLParam('gameId');
  const [magicItemId] = useURLParam('magicItemId');

  const api = useAPI()
  const [identity] = useStoredValue(identityStore)

  if (!gameId || !magicItemId)
    return '404';
  if (!identity)
    return '401';
  const [game] = useAsync(async () => api.game.read(gameId), [api, gameId])
  if (!game)
    return 'Loading';

  const data = useGameData(game, identity.proof.userId, useGameUpdateTimes(api.game, gameId), api);

  const selectedMagicItem = data.magicItems.find(m => m.id === magicItemId)

  if (!selectedMagicItem)
    return 'No Item';

  const cameraRef = useRef();

  return [
    h(FullscreenCanvasScene, { cameraRef }, [
      h(perspectiveCamera, { ref: cameraRef }),
      h(WildspaceStarfieldScene)
    ]),
    h('div', { class: styles.magicItemPage }, [
      h('div', { class: styles.magicItemPageContent}, [
        h(MagicItemCard, { magicItem: selectedMagicItem })
      ]),
    ])
  ];
}