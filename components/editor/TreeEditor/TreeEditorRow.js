// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './TreeEditorRow.module.css';

/*::
export type TreeEditorRowProps = {
  selected: boolean,
  title: string,
  tag?: string,
  innerChildren?: ?ElementNode,
  externalChildren?: ?ElementNode,
}
*/

export const TreeEditorRow/*: Component<TreeEditorRowProps>*/ = ({
  selected,
  title,
  tag,
  innerChildren,
  externalChildren,
}) => {
  return h('div', { class: styles.row }, [
    h('div', {  class: styles.rowNode }, [
      h('input', { type: 'checkbox', checked: selected }),
      h('span', {}, title),
      !!innerChildren && innerChildren,
    ]),
    !!tag && h('span', { class: styles.tag }, tag),
    !!externalChildren && externalChildren,
  ]);
}