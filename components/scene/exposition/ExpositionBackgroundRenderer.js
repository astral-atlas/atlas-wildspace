// @flow strict
import { h } from "@lukekaalim/act";
import { ExpositionColor } from "./ExpositionColor";
import { ExpositionImage } from "./ExpositionImage";
import { MiniTheaterCanvas } from "../../miniTheater/MiniTheaterCanvas";
import { ExpositionMiniTheater } from "./ExpositionMiniTheater";

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
      return h(ExpositionImage, { imageAssetId: background.assetId, assets })
    case 'mini-theater':
    default:
      return null;
  }
}