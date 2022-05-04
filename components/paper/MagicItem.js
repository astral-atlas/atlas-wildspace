// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { MagicItem } from "@astral-atlas/wildspace-models";
*/
import { h, useEffect, useRef } from "@lukekaalim/act";
import { MarkdownRenderer } from "@lukekaalim/act-markdown";
import { BannerDivider, FeatureDivider, SquareDivider } from "../dividers/box";

import styles from './MagicItem.module.css';

/*::
export type MagicItemCardProps = {
  magicItem: MagicItem
};

*/

export const MagicItemCard/*: Component<MagicItemCardProps>*/ = ({ magicItem }) => {
  const ref = useRef/*:: <?HTMLElement>*/();

  return h('div', { ref, class: styles.magicItemRoot }, h(FeatureDivider, { class: styles.magicItem }, [
    h(SquareDivider, { class: styles.titleContainer }, h('h3', { class: styles.title }, magicItem.title)),
    h('div', { class: styles.titlePadding }),
    h('div', { class: styles.description }, [
      h('div', { class: styles.descriptionContent }, [
        h(MarkdownRenderer, { markdownText: magicItem.description })
      ])
    ])
  ]));
};
