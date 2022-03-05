// @flow strict
/*:: import type { Component, Ref } from '@lukekaalim/act'; */

/*:: import type { PerspectiveCamera, Scene, Vector2 } from "three"; */

import { h, useRef, useEffect } from "@lukekaalim/act";
import { perspectiveCamera, scene, useLookAt, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";
import { GridHelperGroup } from "./controls/helpers";
import { useRenderLoopManager } from "./controls/loop";
import styles from './demo.module.css';
import { Vector3 } from "three";

const useAnimationContext = (canvasRef, sceneRef, cameraRef, webgl) => {
  const [onLoop, loopContext] = useRenderLoopManager()

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: scene } = sceneRef;
    const { current: camera } = cameraRef;
    if (!canvas || !scene || !camera || !webgl)
      return;

    const renderVars = {
      delta: 0,
      now: performance.now(),
    }
    const renderConsts = {
      canvas,
      scene,
      camera,
      renderer: webgl
    }
    const onFrame = (now) => {
      renderVars.delta = now - renderVars.now;
      renderVars.now = now;

      onLoop(renderConsts, renderVars);

      id = requestAnimationFrame(onFrame);
    }
    let id = requestAnimationFrame(onFrame);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [webgl]);

  useEffect(() => loopContext.subscribeRender((renderConsts) => {
    renderConsts.renderer.render(renderConsts.scene, renderConsts.camera);
  }), [])

  return loopContext;
}

export const useResizingCamera = (size/*: ?Vector2*/, cameraRef/*: Ref<?PerspectiveCamera>*/) => {
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !size)
      return;
    
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix()
  }, [size])
}


export const useDemoSetup = ()/*: { canvasRef: Ref<?HTMLCanvasElement>, cameraRef: Ref<?PerspectiveCamera>, sceneRef: Ref<?Scene> }*/ => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const webgl = useWebGLRenderer(canvasRef);
  const size = useResizingRenderer(canvasRef, webgl);
  useResizingCamera(size, cameraRef)
  useAnimationContext(canvasRef, sceneRef, cameraRef, webgl);

  return { canvasRef, cameraRef, sceneRef };
}

export const GeometryDemo/*: Component<>*/ = ({ children }) => {
  const { canvasRef, cameraRef, sceneRef } = useDemoSetup();

  useLookAt(cameraRef, new Vector3(0, 0, 0), []);

  return [
    h('canvas', { ref: canvasRef, class: styles.bigDemoCanvas }),
    h(scene, { ref: sceneRef }, [
      h(perspectiveCamera, { ref: cameraRef, position: new Vector3(16, 16, 16), fov: 16 }),
      h(GridHelperGroup, { interval: 10, size: 10 }),
      children,
    ])
  ];
};