// @flow strict

import { h } from "@lukekaalim/act"
import { ExpositionDescription } from "./exposition/ExpositionDescription";

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
    case 'none':
    default:
      return null;
  }
}