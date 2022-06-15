// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Navigation } from "@lukekaalim/act-navigation";
import type { UserID } from "@astral-atlas/sesame-models";

import type { AppSetup } from "./useAppSetup";
import type { KeyboardStateEmitter } from "@astral-atlas/wildspace-components";
import type { GameID, RoomID } from "@astral-atlas/wildspace-models";

import type { GameAppPage } from "./WildspaceGame";
*/
import { useElementKeyboard, useFullscreen, useRefMap,  } from "@astral-atlas/wildspace-components";
import { h, useMemo, useRef, useState } from "@lukekaalim/act";

import { useAppSetup } from "./useAppSetup";
import { WildspaceGame } from "./WildspaceGame";
import { maxSpan, useAnimatedNumber, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { useRootNavigation } from "@lukekaalim/act-navigation";
import { WildspaceRoom } from "./WildspaceRoom";

import styles from './App.module.css';
import { useFadeTransition } from "@astral-atlas/wildspace-components";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";

/*::
export type AppPage =
  | GameAppPage

  | { key: 'room', path: '/room', query: { gameId: GameID, roomId: RoomID } }
*/

/*::
export type AppController = {
  ...AppSetup,
  userId: UserID,
  navigation: Navigation,
  emitter: KeyboardStateEmitter,

  loaded: boolean,
  completeInitialLoad: (pageKey: string) => void,

  page: AppPage,
  setPage: AppPage => void,

  setFullscreen: (isFullscreen: boolean) => void,
}
*/

const getAppPage = (navigation/*: Navigation*/)/*: AppPage*/ => {
  const gameId = navigation.location.searchParams.get("gameId") || null;
  const roomId = navigation.location.searchParams.get("roomId") || null;

  const defaultPage = { key: 'game', path: '/', query: { gameId }};

  switch (navigation.location.pathname) {
    default:
    case '/':
      return defaultPage;
    case '/prep':
      if (!gameId)
        return defaultPage;
      return { key: 'game', path: '/prep', query: { gameId }}
    case '/room':
      if (!gameId || !roomId)
        return defaultPage;
      return { key: 'room', path: '/room', query: { gameId, roomId }}
  }
}

export const App/*: Component<>*/ = () => {
  const setup = useAppSetup();
  const navigation = useRootNavigation();

  const rootRef = useRef();
  const [initialLoad, setInitialLoad] = useState(false);
  const completeInitialLoad = (key) => {
    setInitialLoad(true);
  }

  const loaded = !!setup && !!initialLoad;

  const [loadingAnimation] = useAnimatedNumber(loaded ? 1 : 0, 0, { duration: 500, impulse: 0 });
  useBezierAnimation(loadingAnimation, point => {
    const { current: root } = rootRef;
    if (!root)  return;
    root.style.opacity = point.position;
  })
  
  const [,setFullscreenElement] = useFullscreen();
  const setFullscreen = (isFullscreen) => {
    setFullscreenElement(isFullscreen ? rootRef.current : null);
  }
  const emitter = useElementKeyboard(rootRef);

  const page = useMemo(() => getAppPage(navigation), [navigation]);
  const setPage = (page) => {
    switch (page.path) {
      case '/':
        const defaultURL = new URL('/', navigation.location);
        if (page.query.gameId)
          defaultURL.searchParams.set('gameId', page.query.gameId)
        return void navigation.navigate(defaultURL)
      case '/prep':
        const prepURL = new URL('/prep', navigation.location)
        prepURL.searchParams.set('gameId', page.query.gameId)
        return void navigation.navigate(prepURL)
      case '/room':
        const roomURL = new URL('/room', navigation.location)
        roomURL.searchParams.set('gameId', page.query.gameId)
        roomURL.searchParams.set('roomId', page.query.roomId)
        return void navigation.navigate(roomURL)
    }
  }

  const appController/*: ?AppController*/ = setup && setup.proof && {
    ...setup,
    userId: setup.proof.userId,
    navigation,
    emitter,

    loaded,
    completeInitialLoad,
    
    page,
    setPage,

    setFullscreen,
  };

  const [createRef, pageAnims] = useFadeTransition(page, page => page.key, [page]);
  /*
  const [createRef, refMap] = useRefMap();
  useTimeSpan(maxSpan([...pageAnims.map(a => a.anim.span), pageLoadedAnimation.span]), now => {
    for (const { anim, key, value } of pageAnims) {
      const element = refMap.get(key);
      if (!element)
        continue;
      const isNextPage = page.key === value.key;
      const fadePoint = calculateCubicBezierAnimationPoint(anim, now);
      const loadingPoint = calculateCubicBezierAnimationPoint(pageLoadedAnimation, now);
      element.style.opacity = `${isNextPage ? Math.max(fadePoint.position, loadingPoint.position) : fadePoint.position}`;
    }
  }, [page, pageIsLoaded]);
  */
  
  return h('div', { ref: rootRef, className: styles.root }, appController && pageAnims.map(anim => {
    const page = anim.value;
    if (!page)
      return null;
    switch (page.key) {
      default:
      case 'game':
        return h(WildspaceGame, { key: anim.key, ref: createRef(anim.key), appController, page });
      case 'room':
        return h(WildspaceRoom, { key: anim.key, ref: createRef(anim.key), appController, page });
    }
  })
  )
};
