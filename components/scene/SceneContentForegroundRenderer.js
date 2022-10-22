// @flow strict

import { h, useRef } from "@lukekaalim/act"
import { ExpositionDescription } from "./exposition/ExpositionDescription";
import { MiniTheaterControls } from "./miniTheater/MiniTheaterControls";
import { MiniTheaterSnackbarControl } from "../snackbar/MiniTheaterSnackbarControl";
import { MiniTheaterLoading } from "./miniTheater/MiniTheaterLoading";
import { emptyRootNode } from "@astral-atlas/wildspace-models";
import { ExpositionSubjectRenderer } from "./exposition/ExpositionSubjectRenderer";
import { ExpositionMagicItemRenderer } from "./exposition/subjects/ExpositionMagicItemRenderer";
import { useFadeTransition } from "../transitions";
import { useBezierAnimation } from "@lukekaalim/act-curve";

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
  const anims = useFadeTransition(foregroundRenderData, rd => {
    switch (rd.type) {
      case 'magic-item':
        return rd.magicItem.id;
      case 'npc':
        return rd.npc.id;
      default:
        return rd.type;
    }
  }, [foregroundRenderData]);

  return anims.map(({ anim, key, value}) => {
    return h(TransitionContainer, {
      key,
      foregroundRenderData: value,
      anim,
    });
  });
}

const style = {

};

const TransitionContainer = ({ foregroundRenderData, anim }) => {
  const ref = useRef();

  useBezierAnimation(anim, (point) => {
    const { current: div } = ref;
    if (!div)
      return;
    div.style.opacity = point.position;
  })

  return h('div', { ref, style },
    h(ForegroundContent, { foregroundRenderData }))
}

const ForegroundContent = ({
  foregroundRenderData,
}) => {
  switch (foregroundRenderData.type) {
    case 'magic-item':
      return h(ExpositionMagicItemRenderer, {
        magicItem: foregroundRenderData.magicItem
      });
    case 'simple-exposition':
      const { subject } = foregroundRenderData;
      return h(ExpositionSubjectRenderer, { subject })
    case 'mini-theater-controls':
      const { controller, state } = foregroundRenderData;
      if (state.resources.loadingAssets)
        return h(MiniTheaterLoading, { state });
      return h(MiniTheaterSnackbarControl, { state, controller });
    case 'none':
    default:
      return null;
  }
}