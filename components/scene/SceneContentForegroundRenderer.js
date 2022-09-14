// @flow strict

import { h } from "@lukekaalim/act"
import { ExpositionDescription } from "./exposition/ExpositionDescription";

/*::
import type { Component } from "@lukekaalim/act";
import type { SceneContent } from "@astral-atlas/wildspace-models";

export type SceneContentForegroundRendererProps = {
  content: SceneContent,
};
*/
export const SceneContentForegroundRenderer/*: Component<SceneContentForegroundRendererProps>*/ = ({
  content,
}) => {
  switch (content.type) {
    case 'exposition':
      const { rootNode, version } = content.exposition.description;
      return h(ExpositionDescription, { rootNode, version })
    default:
      return null;
  }
}