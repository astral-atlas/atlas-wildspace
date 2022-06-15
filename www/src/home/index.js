// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { Navigation } from "@lukekaalim/act-navigation"; */
/*::
import type { Ref } from "@lukekaalim/act";
import type { Camera, PerspectiveCamera } from "three";
*/

import { FullscreenToggle, HomepageRoomSelector, HompepageLoginPrompt, useAsync, useFullscreen, useRenderSetup, UserTablet, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";
import { createContext, h, useEffect, useRef, useState } from "@lukekaalim/act";
import { perspectiveCamera, scene, useRenderLoop, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";

import styles from './index.module.css';
import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { useIdentity } from "../../hooks/identity";
import { useWildspaceState } from "../../hooks/app";
import { useAPI } from "../../hooks/api";
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";
import { requestLinkGrant } from "@astral-atlas/sesame-components";
import { createInitialCubicBezierAnimation, interpolateCubicBezierAnimation, useBezierAnimation } from "@lukekaalim/act-curve";
import { useRenderLoopManager } from "../../../docs/src/controls/loop";
import { Color, Vector2 } from "three";

import wwwPackage from '../../package.json';


/*::
export type SceneContext = {

};
*/
const sceneContext = createContext/*:: <?SceneContext>*/(null)

const getSize = (entry) => {
  if (entry.contentBoxSize) {
    const width = entry.contentBoxSize[0].inlineSize;
    const height = entry.contentBoxSize[0].blockSize;
    return new Vector2(width, height);
  } else if (entry.contentRect) {
    return new Vector2(entry.contentRect.width, entry.contentRect.height);
  } else {
    throw new Error()
  }
}

const useHalfResizingRenderer = (
  canvasRef,
  renderer,
  onResize,
) => {
  const [size, setSize] = useState(null)
  useEffect(() => {
    const { current: canvas } = canvasRef; 
    if (!canvas || !renderer)
      return null;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries.filter(e => e.target === canvas)) {
        const size = getSize(entry)
        setSize(size);
        renderer.setSize(size.x, size.y, false);
        onResize(size);
      }
    });
    observer.observe(canvas, { box: 'content-box' });

    return () => {
      observer.unobserve(canvas);
      setSize(null);
    }
  }, [renderer]);

  return size;
}

export const FullscreenCanvasScene/*: Component<{ cameraRef: Ref<?PerspectiveCamera> }>*/ = ({ children, cameraRef, ...props }) => {
  const style = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0
  };
  const render = useRenderSetup({ cameraRef })

  return (
    h('canvas', { ...props, style, ref: render.canvasRef },
      h(scene, { ref: render.sceneRef, background: new Color(`#190535`) }, children))
  );
}

const HomePageContent = ({ nav }) => {
  const client = useAPI();

  const onRoomSelect = (gameId, roomId) => {
    const url = new URL('/room', nav.location);
    url.searchParams.append('gameId', gameId);
    url.searchParams.append('roomId', roomId);
    nav.navigate(url);
  }
  const onLoginClick = async () => {
    const { grant, proof, secret, token } = await requestLinkGrant(new URL(`https://sesame.astral-atlas.com`))
    setIdentity({ proof });
  };
  
  const [identity, setIdentity] = useIdentity()

  if (!identity)
    return h(HompepageLoginPrompt, { onLoginClick }, `Login`);

  return h(HomepageRoomSelector, { client, onRoomSelect })
}

const AccountDetails = () => {
  const client = useAPI();
  const [identity, setIdentity] = useIdentity()

  if (!identity)
    return null

  const [user] = useAsync(async () => identity ? await client.self() : null, [identity]);

  if (!user)
    return null

  const onLogoutClick = () => {
    setIdentity(null)
  }

  return h(UserTablet, { onLogoutClick, name: user.name, sesameURL: new URL(`https://sesame.astral-atlas.com`) })
};

export const HomePage/*: Component<{ nav: Navigation }>*/ = ({ nav }) => {

  const [animation] = useState(interpolateCubicBezierAnimation(
    createInitialCubicBezierAnimation(0),
    1,
    20000,
    3,
    performance.now()
  ));

  useBezierAnimation(animation, (point) => {
    const { current: h1 } = titleRef;
    if (!h1)
      return;
    h1.style.opacity = Math.min(1, point.position * 10);
    h1.style.letterSpacing = (48 + (point.position * 58)) + `px`;
  })
  const rootRef = useRef()
  const titleRef = useRef()
  const cameraRef = useRef();

  const [fullscreenElement, setFullscreen] = useFullscreen()
  const onFullscreenClick = () => {
    const { current: root } = rootRef;
    if (!root)
      return;
    setFullscreen(fullscreenElement === root ? null : root)
  }

  return h('div', { ref: rootRef, classList: [styles.root] }, [
    h(FullscreenCanvasScene, { cameraRef }, [
      h(WildspaceStarfieldScene),
      h(perspectiveCamera, { ref: cameraRef })
    ]),
    h('div', { classList: [styles.homePageContainer] }, [
      h('div', { style: {
        flex: 1, flexBasis: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      } }, [
        h('h1', { ref: titleRef, classList: [styles.wildspaceTitle] }, 'WildSpace'),
      ]),
      h('div', { style: {
        position: 'absolute',
        right: '24px',
        top: '24px'
      }}, [
        h(AccountDetails, {})
      ]),
      h('div', { style: {
        position: 'absolute',
        left: '24px',
        top: '24px'
      }}, [
        h(FullscreenToggle, { onFullscreenClick })
      ]),
      h('div', {
        style: {
          position: 'absolute',
          bottom: '24px',
          left: '24px',
        }
      }, h('pre', {}, `${wwwPackage.name}@${wwwPackage.version}`)
      ),
      h('div', { classList: [styles.homePageRoomContainer] }, [
        h(HomePageContent, { nav }),
      ])
    ]),
  ]);
};