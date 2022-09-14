// @flow strict
import { h } from '@lukekaalim/act';
import styles from './exposition.module.css';
/*::
import type { AssetID } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { Component } from "@lukekaalim/act";
*/

/*::
export type ExpositionImageProps = {
  assets: AssetDownloadURLMap,
  imageAssetId: AssetID
};
*/

export const ExpositionImage/*: Component<ExpositionImageProps>*/ = ({
  assets,
  imageAssetId
}) => {
  const asset = assets.get(imageAssetId);
  if (!asset)
    return null;
  
  return h('div', { style: { backgroundImage: `url(${asset.downloadURL})` }, class: styles.expositionImage });
}