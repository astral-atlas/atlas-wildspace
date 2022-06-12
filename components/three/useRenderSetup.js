// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { LoopController, RenderLoopConstants } from "./useLoopController";
import type { PerspectiveCamera, Scene } from "three";

import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { KeyboardTrack } from "../keyboard/track";
*/
import { useEffect, useRef } from "@lukekaalim/act";
import { useDisposable, useWebGLRenderer } from "@lukekaalim/act-three";

import { WebGLRenderer, sRGBEncoding } from "three";
import { useLoopController } from "./useLoopController";
import { useElementKeyboard, useKeyboardTrack } from "../keyboard";

/*::
export type RenderSetup = {
  canvasRef: Ref<?HTMLCanvasElement>,
  cameraRef: Ref<?PerspectiveCamera>,
  sceneRef: Ref<?Scene>,

  loop: LoopController,
  keyboard: KeyboardTrack
};
*/

export const useRenderSetup = (
  overrides/*: {
    canvasRef?:  Ref<?HTMLCanvasElement>,
    cameraRef?: Ref<?PerspectiveCamera>,
    keyboardEmitter?: KeyboardStateEmitter,
  }*/ = {},
  onRendererInit/*: RenderLoopConstants => mixed*/ = _ => {},
)/*: RenderSetup*/ => {
  const localCanvasRef = useRef();
  const canvasRef = overrides.canvasRef || localCanvasRef;

  const localCameraRef = useRef();
  const cameraRef = overrides.cameraRef || localCameraRef;
  const sceneRef = useRef();


  const localEmitter = useElementKeyboard(canvasRef);
  const emitter = overrides.keyboardEmitter || localEmitter;

  const keyboard = useKeyboardTrack(emitter);

  const [runLoop, loop] = useLoopController();

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    if (!canvas || !camera || !scene)
      return;

    const options = {
      canvas,
    }
    const renderer = new WebGLRenderer(options);
    renderer.outputEncoding = sRGBEncoding;

    const rendererConstants = {
      renderer,
      canvas,
      camera,
      scene
    };
    let prevTime = performance.now();
    const onFrame = (now) => {
      const delta = now - prevTime;
      prevTime = now;
      const rendererVariables = {
        now,
        delta
      };
      runLoop(rendererConstants, rendererVariables);
      frameId = requestAnimationFrame(onFrame);
    };
    const onCanvasResize = (entries) => {
      const [entry] = entries;
      if (!entry)
        return;
      const [contentSize] = entry.contentBoxSize;
      renderer.setSize(contentSize.inlineSize, contentSize.blockSize, false);

      camera.aspect = contentSize.inlineSize / contentSize.blockSize;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(onCanvasResize);
    resizeObserver.observe(canvas);
    const cancelRenderSubscription = loop.subscribeRender((c, v) => {
      c.renderer.render(c.scene, c.camera);
    })
    let frameId = requestAnimationFrame(onFrame);

    onRendererInit(rendererConstants);

    return () => {
      renderer.dispose();
      resizeObserver.disconnect();
      cancelRenderSubscription();
      cancelAnimationFrame(frameId);
    }
  }, [overrides.canvasRef])

  return {
    canvasRef,
    cameraRef,
    sceneRef,
    keyboard,

    loop,
  };
};

