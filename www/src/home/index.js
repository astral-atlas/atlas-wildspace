// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { HomepageRoomSelector } from "@astral-atlas/wildspace-components";
import { createContext, h, useEffect, useRef } from "@lukekaalim/act";
import { scene, useRenderLoop, useWebGLRenderer } from "@lukekaalim/act-three";

import styles from './index.module.css';
import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { useIdentity } from "../../hooks/identity";
import { useWildspaceState } from "../../hooks/app";
import { useAPI } from "../../hooks/api";
import { useNavigation } from "../../hooks/navigation";

/*::
export type SceneContext = {

};
*/
const sceneContext = createContext/*:: <?SceneContext>*/(null)

const FullscreenCanvasScene = ({ children, ...props }) => {
  const style = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0
  };
  const canvasRef = useRef();
  const sceneRef = useRef();
  const renderer = useWebGLRenderer(canvasRef, { antialias: true });

  useEffect(() => {
    if (!renderer)
      return;

    //renderer.render()
  }, []);

  return (
    h('canvas', { ...props, style, ref: canvasRef },
      h(scene, { sceneRef }, ))
  );
}

export const HomePage/*: Component<>*/ = () => {
  const client = useAPI();
  const nav = useNavigation();
  const onRoomSelect = (gameId, roomId) => {
    const url = new URL('/room', nav.url);
    url.searchParams.append('gameId', gameId);
    url.searchParams.append('roomId', roomId);
    nav.navigate(url);
  }

  return [
    h(FullscreenCanvasScene, {}, [

    ]),
    h('div', { classList: [styles.homePageContainer] }, [
      h('div', { style: {
        flex: 1, flexBasis: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      } },
        h('h1', { classList: [styles.wildspaceTitle] }, 'WildSpace')
      ),
      h('div', { classList: [styles.homePageRoomContainer] }, [
        h(HomepageRoomSelector, { client, onRoomSelect })
      ])
    ]),
  ];
};