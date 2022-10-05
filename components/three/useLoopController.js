// @flow strict
/*::
import type { Context } from "@lukekaalim/act/context";
import type { Camera, WebGLRenderer, Scene } from "three";
*/

import { createContext, useEffect, useMemo, useState } from "@lukekaalim/act";


/*::
export type RenderLoopConstants = {
  renderer: WebGLRenderer,
  css2dRenderer: any,
  camera: Camera,
  canvas: HTMLCanvasElement,
  scene: Scene
};
export type RenderLoopVariables = {
  now: DOMHighResTimeStamp,
  delta: number,
};

export type OnLoop = (renderConsts: RenderLoopConstants, renderVars: RenderLoopVariables) => mixed;

export type LoopController = {
  subscribeInput:     (onInput: OnLoop) => () => void,
  subscribeSimulate:  (onSimulate: OnLoop) => () => void,
  subscribeRender:    (onRender: OnLoop) => () => void,
  
  runLoop: (
    renderConsts: RenderLoopConstants,
    renderVars: RenderLoopVariables,
  ) => void,
};
*/

export const loopControllerContext/*: Context<LoopController>*/ = createContext({
  subscribeInput: () => { throw new Error(`No Loop Manager in Context`) },
  subscribeSimulate: () => { throw new Error(`No Loop Manager in Context`) },
  subscribeRender: () => { throw new Error(`No Loop Manager in Context`) },

  runLoop: () => {},
})

const createLoopController = ()/*: LoopController*/ => {
  const input = new Set();
  const simulate = new Set();
  const render = new Set();

  const subscribeInput = (onInput) => {
    const handler = { onInput };
    input.add(handler);
    return () => void input.delete(handler);
  }
  const subscribeSimulate = (onSimulate) => {
    const handler = { onSimulate };
    simulate.add(handler);
    return () => void simulate.delete(handler);
  }
  const subscribeRender = (onRender) => {
    const handler = { onRender };
    render.add(handler);
    return () => void render.delete(handler);
  };

  const runLoop = (renderConsts/*: RenderLoopConstants*/, renderVars/*: RenderLoopVariables*/) => {
    for (const { onInput } of input)
      onInput(renderConsts, renderVars)

    for (const { onSimulate } of simulate)
      onSimulate(renderConsts, renderVars)

    for (const { onRender } of render)
      onRender(renderConsts, renderVars)
  };
  
  return { runLoop, subscribeInput, subscribeRender, subscribeSimulate };
}


export const useLoopController = ()/*: LoopController*/ => {
  const [loop] = useState/*:: <LoopController>*/(() => createLoopController());
  return loop;
};


export const useSimulateLoop = (
  loop/*: LoopController*/,
  setup/*: () => ?((c: RenderLoopConstants, v: RenderLoopVariables) => void)*/,
  deps/*: mixed[]*/ = [],
) => {
  useEffect(() => {
    const loopFunc = setup();
    if (!loopFunc)
      return;
    const cancelLoop = loop.subscribeSimulate(loopFunc);
    return cancelLoop;
  }, [loop, ...deps])
}