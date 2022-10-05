// @flow strict
import { h } from "@lukekaalim/act";
import { ExpositionColor } from "./ExpositionColor";
import { ExpositionImage } from "./ExpositionImage";
import { MiniTheaterCanvas } from "../../miniTheater/MiniTheaterCanvas";

/*::
import type { AssetDownloadURLMap } from "@astral-atlas/wildspace-components";
import type { ExpositionBackground, MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";

export type ExpositionBackgroundRendererProps = {
  background: ExpositionBackground,
  assets: AssetDownloadURLMap,
};
*/


export const ExpositionBackgroundRenderer/*: Component<ExpositionBackgroundRendererProps>*/ = ({
  background,
  assets,
}) => {
  switch (background.type) {
    case 'color':
      return h(ExpositionColor, { color: background.color })
    case 'image':
      const info = assets.get(background.assetId);
      if (!info)
        return null;
      const imageURL = info.downloadURL;
      return h(ExpositionImage, { imageURL })
    case 'mini-theater':
    default:
      return null;
  }
}