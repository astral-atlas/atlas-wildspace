// @flow strict
/*::
import type { Pass } from "three/addons/postprocessing/EffectComposer.js";

import type { RenderSetup, RenderSetupOverrides } from "./useRenderSetup";
import type { RenderLoopConstants } from "./useLoopController";
*/
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

import { useRenderSetup } from "./useRenderSetup";
import { useMemo, useState, useEffect } from '@lukekaalim/act';

export const usePostProcessRenderSetup = (
  initializePasses/*: (setup: RenderSetup, constants: RenderLoopConstants) => Pass[]*/,
  overrides/*: ?RenderSetupOverrides*/ = null,
  deps/*: mixed[]*/ = [],
)/*: RenderSetup*/ => {
  const [constants, setConstants] = useState(null)
  const onRendererInit = (c) => {
    setConstants(c)
  };
  const renderFunction = (c, v) => {

  };
  const setup = useRenderSetup({
    renderFunction,
    ...overrides
  }, onRendererInit, deps)

  useEffect(() => {
    if (!constants)
      return;
    const { camera, scene, renderer, canvas } = constants;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    for (const pass of initializePasses(setup, constants))
      composer.addPass(pass);
    
    const onRender = (c, v) => {
      composer.render();
      overrides
        && overrides.renderFunction
        && overrides.renderFunction(c, v);
    }
    const onCanvasResize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      composer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(onCanvasResize);
    resizeObserver.observe(canvas);
    onCanvasResize();

    const unsubscribeRender = setup.loop.subscribeRender(onRender);
    return () => {
      unsubscribeRender();
      resizeObserver.disconnect();
    };
  }, [constants, ...deps])

  return setup;
};
