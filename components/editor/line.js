// @flow strict

import { h } from "@lukekaalim/act";
import styles from './index.module.css';

/*::
import type { Component } from "@lukekaalim/act";

*/

export const EditorLine/*: Component<>*/ = ({ children }) => {
  return h('hr', { class: styles.line }, children)
};