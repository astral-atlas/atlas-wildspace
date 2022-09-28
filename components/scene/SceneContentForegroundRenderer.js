// @flow strict

import { h } from "@lukekaalim/act"
import { ExpositionDescription } from "./exposition/ExpositionDescription";
import { MiniTheaterControls } from "./miniTheater/MiniTheaterControls";

/*::
import type { Component } from "@lukekaalim/act";
import type { SceneContent } from "@astral-atlas/wildspace-models";
import type { SceneContentForegroundRenderData } from "./SceneRenderer2";

export type SceneContentForegroundRendererProps = {
  foregroundRenderData: SceneContentForegroundRenderData,
};
*/
export const SceneContentForegroundRenderer/*: Component<SceneContentForegroundRendererProps>*/ = ({
  foregroundRenderData,
}) => {
  switch (foregroundRenderData.type) {
    case 'exposition':
      const { description } = foregroundRenderData;
      return h(ExpositionDescription, { description, version: 0 })
    case 'mini-theater-controls':
      const { controller, state } = foregroundRenderData;
      return h(MiniTheaterControls, { state, controller })
    case 'none':
    default:
      return null;
  }
}