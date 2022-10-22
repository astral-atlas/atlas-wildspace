// @flow strict
/*::
import type { MagicItem } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { MagicItemRenderer } from "../../../magicItem/MagicItemRenderer";
import { h } from "@lukekaalim/act"

import styles from './ExpositionMagicItemRenderer.module.css';

/*::
export type ExpositionMagicItemRendererProps = {
  magicItem: MagicItem
}
*/
export const ExpositionMagicItemRenderer/*: Component<ExpositionMagicItemRendererProps>*/ = ({
  magicItem,
}) => {
  return h('div', { class: styles.exposition },
    h('div', { class: styles.container },
      h(MagicItemRenderer, { magicItem })))
}