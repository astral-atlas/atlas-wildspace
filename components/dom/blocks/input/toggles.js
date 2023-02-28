// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './toggles.module.css';

/*::
export type ExpandToggleInputProps = {
  expanded: boolean,
  onExpandedChange?: boolean => mixed,
}
*/

export const ExpandToggleInput/*: Component<ExpandToggleInputProps>*/ = ({
  expanded,
  onExpandedChange = _ => {}
}) => {
  return h('span', { class: styles.expandButtonColumn }, [
    h('button', {
      classList: [styles.expandButton, expanded && styles.expanded], 
      onClick: () => onExpandedChange(!expanded)
    }),
  ])
}