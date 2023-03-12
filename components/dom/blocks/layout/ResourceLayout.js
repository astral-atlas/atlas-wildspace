// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './ResourceLayout.module.css';

/*::

*/

export const ResourceLayout/*: Component<>*/ = ({
  children
}) => {
  return h('div', { class: styles.container }, [
    children
  ])
}