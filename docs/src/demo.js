// @flow strict
/*:: import type { Component, Ref } from '@lukekaalim/act'; */
/*:: import type { SceneProps } from '@lukekaalim/act-three'; */

/*:: import type { PerspectiveCamera, Scene, Vector2 } from "three"; */
/*:: import type { LoopContextValue } from "./controls/loop"; */

import { h, useRef, useEffect } from "@lukekaalim/act";
import { perspectiveCamera, scene, useLookAt, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";
import { GridHelperGroup } from "./controls/helpers";
import { useRenderLoopManager } from "./controls/loop";
import styles from './demo.module.css';
import { Vector3 } from "three";
import { raycastManagerContext, useRaycastManager } from "./controls/raycast";

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


export const useDemoSetup = ()/*: { canvasRef: Ref<?HTMLCanvasElement>, cameraRef: Ref<?PerspectiveCamera>, sceneRef: Ref<?Scene>, loop: LoopContextValue }*/ => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const webgl = useWebGLRenderer(canvasRef);
  const size = useResizingRenderer(canvasRef, webgl);
  useResizingCamera(size, cameraRef)
  const loop = useAnimationContext(canvasRef, sceneRef, cameraRef, webgl);

  return { canvasRef, cameraRef, sceneRef, loop };
}

/*::
export type GeometryDemoProps = {
  sceneProps?: SceneProps,
  canvasProps?: { [string]: mixed },
  showGrid?: boolean,
}
*/

export const GeometryDemo/*: Component<GeometryDemoProps>*/ = ({
  children,
  showGrid = true,
  sceneProps,
  canvasProps
}) => {
  const { canvasRef, cameraRef, sceneRef, loop } = useDemoSetup();
  const raycast = useRaycastManager();

  useLookAt(cameraRef, new Vector3(0, 0, 0), []);
  useEffect(() => {
    return loop.subscribeInput((loopConsts) => raycast.onUpdate(loopConsts.camera));
  }, [loop, raycast.onUpdate])

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas) return;
    canvas.addEventListener('click', raycast.onClick);
    canvas.addEventListener('mouseenter', raycast.onMouseEnter);
    canvas.addEventListener('mousemove', raycast.onMouseMove);
    canvas.addEventListener('mouseleave', raycast.onMouseLeave);
    return () => {
      canvas.removeEventListener('click', raycast.onClick);
      canvas.removeEventListener('mouseenter', raycast.onMouseEnter);
      canvas.removeEventListener('mousemove', raycast.onMouseMove);
      canvas.removeEventListener('mouseleave', raycast.onMouseLeave);
    }
  }, [raycast])

  return [
    h('canvas', { ...canvasProps, ref: canvasRef, class: styles.bigDemoCanvas }),
    h(scene, { ...sceneProps, ref: sceneRef }, [
      h(raycastManagerContext.Provider, { value: raycast }, [
        children,
      ]),
      h(perspectiveCamera, { ref: cameraRef, position: new Vector3(16, 16, 16), fov: 16 }),
      showGrid && h(GridHelperGroup, { interval: 10, size: 10 }),
    ])
  ];
};

/*::
export type DOMDemoProps = {

};
*/

export const DOMDemo/*: Component<DOMDemoProps>*/ = () => {
  return h('div', {}, [
    
  ])
}