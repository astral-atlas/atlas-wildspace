// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act"

import styles from './WindowScreen.module.css';

export const WindowScreen/*: Component<>*/ = ({ children }) => {
  return h('div', { className: styles.screen },
    h('div', { className: styles.window },
      children))
}