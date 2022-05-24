// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Camera, OrthographicCamera, PerspectiveCamera, Scene } from "three";
*/

import { h, useEffect, useRef } from "@lukekaalim/act";
import { scene, useRenderLoop, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";

import { Color } from "three";


/*::
export type ThreeCanvasSceneProps = {
  cameraRef: Ref<?(PerspectiveCamera)>,
  sceneRef?: ?Ref<?Scene>,
  canvasRef?: ?Ref<?HTMLCanvasElement>,
  rendererDeps?: mixed[],
  onLoop?: ?(now: number, delta: number) => mixed,
  canvasProps?: { ... }
};
*/

export const ThreeCanvasScene/*: Component<ThreeCanvasSceneProps>*/ = ({
  children,
  cameraRef,
  sceneRef,
  canvasRef,
  onLoop = (_, __) => {},
  canvasProps = {},
  rendererDeps = []
}) => {
  const localCanvasRef = useRef()
  const localSceneRef = useRef();

  const finalSceneRef = sceneRef || localSceneRef;
  const finalCanvasRef = canvasRef || localCanvasRef;

  const renderer = useWebGLRenderer(finalCanvasRef, { clearColor: 'white', antialias: true, shadowMap: { enabled: true } });
  useResizingRenderer(finalCanvasRef, renderer, cameraRef);

  useRenderLoop(renderer, cameraRef, finalSceneRef, (now, delta) => {
    onLoop && onLoop(now, delta);
  }, rendererDeps);

  return [
    h('canvas', { ...canvasProps, ref: finalCanvasRef }),
    h(scene, { ref: finalSceneRef, background: new Color('white') }, children),
  ]
};
