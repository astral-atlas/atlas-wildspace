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
  imageURL: string
};
*/

export const ExpositionImage/*: Component<ExpositionImageProps>*/ = ({
  imageURL
}) => {
  return h('div', {
    style: {backgroundImage: `url(${imageURL})` },
    class: styles.expositionImage
  });
}