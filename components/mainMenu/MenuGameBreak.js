// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act";

import styles from './MenuGameBreak.module.css';

export const MenuGameBreak/*: Component<>*/ = () => {
  return h('hr', { className: styles.menuGameBreak });
};
