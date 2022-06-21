// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './MenuGameDescriptor.module.css';

export const MenuGameDescriptor/*: Component<>*/ = ({ children }) => {
  return h('span', { className: styles.menuGameDescriptor }, children)
};
