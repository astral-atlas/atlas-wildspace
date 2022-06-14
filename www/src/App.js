// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { MiniTheaterCanvas, useAsync, useMiniTheaterController, useResourcesLoader, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { loadConfigFromURL } from "../config";
import { useStoredValue } from "../hooks/storage";
import { identityStore } from "../lib/storage";
import { useAppSetup } from "./useAppSetup";
import { FullscreenCanvasScene } from "./home";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { PrepPage } from "./prep";
import { WildspaceGame } from "./WildspaceGame";
import { useAnimatedNumber, useBezierAnimation } from "@lukekaalim/act-curve";
import { useURLParam } from "../hooks/navigation";
import { useRootNavigation } from "@lukekaalim/act-navigation";

const GAME_ID = 'e35603d2-5601-470a-9b63-ba5078974b5e';
const MINI_THEATER_ID = 'a975c6d1-e488-425c-899b-5fc75a10b56b';

import styles from './App.module.css';

export const App/*: Component<>*/ = () => {
  const navigation = useRootNavigation()

  const setup = useAppSetup();

  const [games] = useAsync(async () => setup && setup.client.game.list(), [setup]);

  const rootRef = useRef();

  const [loadingAnimation] = useAnimatedNumber(games ? 1 : 0, 0, { duration: 500, impulse: 0 });
  useBezierAnimation(loadingAnimation, point => {
    const { current: root } = rootRef;
    if (!root)  return;
    root.style.opacity = point.position;
  })
  
  return h('div', { ref: rootRef, className: styles.root }, [
    !!setup && !!games && !!setup.proof && h(WildspaceGame, { ...setup, navigation, games, userId: setup.proof.userId })
  ])
};
