// @flow strict

import { h } from "@lukekaalim/act"
import { ExpositionDescription } from "./exposition/ExpositionDescription";
import { MiniTheaterControls } from "./miniTheater/MiniTheaterControls";
import { MiniTheaterSnackbarControl } from "../snackbar/MiniTheaterSnackbarControl";
import { MiniTheaterLoading } from "./miniTheater/MiniTheaterLoading";
import { emptyRootNode } from "@astral-atlas/wildspace-models";

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
      const { subject } = foregroundRenderData;
      return h(ExpositionDescription, { description: emptyRootNode, version: 0 })
    case 'mini-theater-controls':
      const { controller, state } = foregroundRenderData;
      if (state.resources.loadingAssets)
        return h(MiniTheaterLoading, { state });
      return h(MiniTheaterSnackbarControl, { state, controller });
      //return h(MiniTheaterControls, { state, controller })
    case 'none':
    default:
      return null;
  }
}