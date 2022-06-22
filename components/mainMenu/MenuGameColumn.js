// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './MenuGameColumn.module.css';

/*::

*/

export const MenuGameColumn/*: Component<>*/ = ({ children }) => {
  return h('div', { className: styles.menuGameColumn }, children);
}