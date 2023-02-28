// @flow strict

import { useState } from "@lukekaalim/act";
import { Camera, Scene, WebGLRenderer } from "three";

/*::

import type { ReadOnlyRef } from "../../three/useChildObject";

export type RenderCanvasController = {
  refs: {
    camera: ReadOnlyRef<Camera>,
    scene: ReadOnlyRef<Scene>,
    canvas: ReadOnlyRef<HTMLCanvasElement>,
  },
  renderer: WebGLRenderer,
};
*/

export const useRenderCanvas = () => {
  const [renderer] = useState(() => new WebGLRenderer())
};