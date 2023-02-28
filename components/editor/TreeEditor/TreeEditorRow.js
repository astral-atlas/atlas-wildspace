// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './TreeEditorRow.module.css';

/*::
export type TreeEditorRowProps = {
  depth?: number,
  
  showExpandButton?: boolean,
  expanded?: boolean,
  onExpandToggle?: boolean => mixed,

  externalChildren?: ?ElementNode,
}
*/

export const TreeEditorRow/*: Component<TreeEditorRowProps>*/ = ({
  depth = 0,
  expanded = false,
  showExpandButton = true,
  onExpandToggle = _ => {},
  children,
  externalChildren,
}) => {
  return h('div', { class: styles.row, style: { paddingLeft: `${depth}rem` } }, [
    h('div', { class: styles.box }, [
      showExpandButton && h('div', { class: styles.expandButtonColumn }, [
        h('button', {
          classList: [styles.expandButton, expanded && styles.expanded], 
          onClick: () => onExpandToggle(!expanded)
        }),
      ]),
      h('span', { class: styles.content }, children),
    ]),
    externalChildren || null,
  ]);
}