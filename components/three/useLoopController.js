// @flow strict
/*::
import type { Context } from "@lukekaalim/act/context";
import type { Camera, WebGLRenderer, Scene } from "three";
*/

import { createContext, useMemo, useState } from "@lukekaalim/act";


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
};
*/

export const loopControllerContext/*: Context<LoopController>*/ = createContext({
  subscribeInput: () => { throw new Error(`No Loop Manager in Context`) },
  subscribeSimulate: () => { throw new Error(`No Loop Manager in Context`) },
  subscribeRender: () => { throw new Error(`No Loop Manager in Context`) },
})

export const useLoopController = ()/*: [OnLoop, LoopController]*/ => {
  const [subscribers] = useState({
    input: new Set(),
    simulation: new Set(),
    render: new Set(),
  });
  
  return useMemo(() => {
    const subscribeInput = (onInput) => {
      subscribers.input.add(onInput);
      return () => void subscribers.input.delete(onInput);
    };
    const subscribeSimulate = (onSimulate) => {
      subscribers.simulation.add(onSimulate);
      return () => void subscribers.simulation.delete(onSimulate);
    };
    const subscribeRender = (onRender) => {
      subscribers.render.add(onRender);
      return () => void subscribers.render.delete(onRender);
    };
    
    const loopController = {
      subscribeInput,
      subscribeSimulate,
      subscribeRender,
    }
    const runLoop = (renderConsts/*: RenderLoopConstants*/, renderVars/*: RenderLoopVariables*/) => {
      for (const subscriber of subscribers.input)
        subscriber(renderConsts, renderVars)

      for (const subscriber of subscribers.simulation)
        subscriber(renderConsts, renderVars)

      for (const subscriber of subscribers.render)
        subscriber(renderConsts, renderVars)
    };

    return [runLoop, loopController];
  }, []);
};
