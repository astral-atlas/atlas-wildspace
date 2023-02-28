// @flow strict

import { createContext, h, useState } from "@lukekaalim/act";
import { useRenderSetup } from "./useRenderSetup";
import { scene } from "@lukekaalim/act-three";

/*::
import type { Component, Context } from "@lukekaalim/act";
import type { RenderSetup, RenderSetupOverrides } from "./useRenderSetup";
*/
/*::
export type RenderCanvasProps = {
  className?: string,
  canvasProps?: { [string]: mixed },
  renderOverride?: RenderSetup,
  renderSetupOverrides?: RenderSetupOverrides,
}
*/

export const RenderCanvas/*: Component<RenderCanvasProps>*/ = ({
  children,
  className = '',
  renderOverride,
  canvasProps = {},
  renderSetupOverrides = {}
}) => {
  const [] = useState(null)
  const localRender = useRenderSetup(renderSetupOverrides)
  const render = renderOverride || localRender;

  return [
    h('div', { ref: render.rootRef, style: { position: 'absolute' } }),
    h('canvas', {
      ...canvasProps,
      ref: render.canvasRef,
      width: 600, height: 300,
      tabIndex: 0,
      className,
    }),
    h(scene, { ref: render.sceneRef },
      h(renderCanvasContext.Provider, { value: render },
        children)),
  ];
};

export const renderCanvasContext/*: Context<?RenderSetup>*/ = createContext(null);