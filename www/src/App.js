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

const GAME_ID = 'e35603d2-5601-470a-9b63-ba5078974b5e';
const MINI_THEATER_ID = 'a975c6d1-e488-425c-899b-5fc75a10b56b';

export const App/*: Component<>*/ = () => {
  const setup = useAppSetup();

  const rootRef = useRef();
  const cameraRef = useRef();

  const [conTime, setConTime] = useState(Date.now());
  const [updates] = useAsync(async () => setup && setup.client.game.updates.create(GAME_ID), [setup, conTime])

  const [miniTheater, setMiniTheater] = useState(null);
  const resources = useResourcesLoader();
  const monsters = [];
  const characters = [];
  const controller = useMiniTheaterController();
  const assets = new Map();


  useEffect(() => {
    if (!updates)
      return;
    const unsubscribeActions = controller.subscribeAction(action => updates.miniTheater.act(MINI_THEATER_ID, action))
    const unsubscribeTheater = updates.miniTheater.subscribe(MINI_THEATER_ID, setMiniTheater);
    return () => {
      unsubscribeActions();
      unsubscribeTheater();
    }
  }, [updates])

  return h('div', { ref: rootRef }, [
    h('button', { onClick: () => setConTime(Date.now()) }, 'Reconnect'),
    !!miniTheater && [
      h(MiniTheaterCanvas, { miniTheater, assets, characters, controller, monsters, resources })
    ]
  ]);
};
