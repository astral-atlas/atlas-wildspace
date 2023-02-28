// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type {
  LoopController,
  RenderLoopConstants,
  RenderLoopVariables,
} from "./useLoopController";
import type { Object3D, PerspectiveCamera, Scene } from "three";

import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { KeyboardTrack } from "../keyboard/track";
*/
import { useEffect, useMemo, useRef } from "@lukekaalim/act";
import { useDisposable, useWebGLRenderer } from "@lukekaalim/act-three";
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { WebGLRenderer, sRGBEncoding } from "three";
import { useLoopController } from "./useLoopController";
import { useElementKeyboard, useKeyboardTrack } from "../keyboard";

/*::
export type RenderSetup = {
  canvasRef: Ref<?HTMLCanvasElement>,
  cameraRef: Ref<?PerspectiveCamera>,
  rootRef: Ref<?HTMLElement>,
  sceneRef: Ref<?Scene>,

  loop: LoopController,
  keyboard: KeyboardTrack
};

export type RenderSetupOverrides = {|
  canvasRef?:  ?Ref<?HTMLCanvasElement>,
  sceneRef?:  ?Ref<?Scene>,
  cameraRef?: ?Ref<?PerspectiveCamera>,
  rootRef?: ?Ref<?HTMLElement>,
  loop?: ?LoopController,
  keyboardEmitter?: ?KeyboardStateEmitter,

  renderFunction?: (
    constants: RenderLoopConstants,
    variables: RenderLoopVariables,
  ) => mixed,
  onResize?: (
    width: number,
    height: number,
  ) => void,
|};
*/

export const useRenderSetup = (
  overrides/*: RenderSetupOverrides*/ = Object.freeze({}),
  onRendererInit/*: ?((c: RenderLoopConstants, s: RenderSetup) => ?(() => mixed))*/ = null,
  deps/*: mixed[]*/ = []
)/*: RenderSetup*/ => {
  const localCanvasRef = useRef();
  const canvasRef = overrides.canvasRef || localCanvasRef;

  const localCameraRef = useRef();
  const cameraRef = overrides.cameraRef || localCameraRef;

  const localSceneRef = useRef();
  const sceneRef = overrides.sceneRef || localSceneRef;

  const localRootRef = useRef();
  const rootRef = overrides.rootRef || localRootRef;

  const localEmitter = useElementKeyboard(canvasRef);
  const emitter = overrides.keyboardEmitter || localEmitter;

  const keyboard = useKeyboardTrack(emitter);

  const internalLoop = useLoopController();
  const loop = overrides.loop || internalLoop;

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    const { current: root } = rootRef;
    if (!canvas || !camera || !scene)
      return;

    const options = {
      canvas,
    }
    const renderer = new WebGLRenderer(options);
    const css2dRenderer = root && new CSS2DRenderer({ element: root });
    renderer.outputEncoding = sRGBEncoding;

    const rendererConstants = {
      css2dRenderer,
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
      loop.runLoop(rendererConstants, rendererVariables);
      frameId = requestAnimationFrame(onFrame);
    };
    const defaultRenderFunction = (c, v) => {
      c.renderer.render(c.scene, c.camera);
      if (c.css2dRenderer)
        c.css2dRenderer.render(c.scene, c.camera);
    }
    const renderFunction = overrides.renderFunction || defaultRenderFunction;
    const onCanvasResize = () => {
      console.log('canvas resize')
      const canvasRect = canvas.getBoundingClientRect();
      renderer.setSize(canvasRect.width, canvasRect.height, false);
      if (css2dRenderer) {
        css2dRenderer.setSize(canvasRect.width, canvasRect.height)
      }

      camera.aspect = canvasRect.width / canvasRect.height;
      camera.updateProjectionMatrix();

      const now = performance.now();
      const delta = now - prevTime;
      const rendererVariables = {
        now,
        delta,
      }
      loop.runRender(rendererConstants, rendererVariables);
    }

    const resizeObserver = new ResizeObserver(onCanvasResize);
    resizeObserver.observe(canvas);
    const cancelRenderSubscription = loop.subscribeRender(renderFunction);
    let frameId = requestAnimationFrame(onFrame);

    if (onRendererInit)
      onRendererInit(rendererConstants, setup);

    return () => {
      renderer.dispose();
      resizeObserver.disconnect();
      cancelRenderSubscription();
      cancelAnimationFrame(frameId);
    }
  }, deps)

  const setup = useMemo(() => ({
    canvasRef,
    cameraRef,
    sceneRef,
    keyboard,
    rootRef,

    loop,
  }), []);
  return setup;
};

