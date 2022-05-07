// @flow strict

/*::
import type { Component, ElementNode } from '@lukekaalim/act';
*/

import { h } from "@lukekaalim/act";
import { CoinLabelDivider, CopperCoinDivider } from "../dividers/box";
import styles from './AttributeTag.module.css';

/*::
export type AttributeTagProps = {
  label: ElementNode,
  classList?: string[],
  alignment?: 'left' | 'right'
}
*/

export const CopperAttributeTag/*: Component<AttributeTagProps>*/ = ({ label, classList = [], children, alignment = 'left' }) => {
  return h('div', { classList: [...classList, styles.attributeTagRoot, styles[alignment]] },
    alignment === 'left' ? [
      h(CoinLabelDivider, { classList: [styles.label] }, label),
      h(CopperCoinDivider, { classList: [styles.value] }, children)
    ] : [
      h(CopperCoinDivider, { classList: [styles.value] }, children),
      h(CoinLabelDivider, { classList: [styles.label] }, label),
    ]
  );
};