// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { PreviewSidebarLayout, ResourceLayout } from "@astral-atlas/wildspace-components"
import { h } from "@lukekaalim/act";
import { FillBlock, FramePresenter } from "./presentation";

export const PreviewSidebarLayoutDemo/*: Component<>*/ = () => {
  return h(FramePresenter, {},
    h(PreviewSidebarLayout, {
      preview: h(FillBlock, {}, "Preview"),
      topPane: h(FillBlock, {}, 'Top Pane'),
      bottomPane: h(FillBlock, {}, "Bottom Pane"),
    }));
}

export const ResourceMetaLayoutDemo/*: Component<>*/ = () => {
  return h(FramePresenter, {},
    h(ResourceLayout, {}, h(FillBlock, { color: 'transparent', invertTextColor: true }, 'Meta Description'))
  );
}