// @flow strict
import { h } from '@lukekaalim/act';
import styles from './page.module.css';
import documentStyles from '@lukekaalim/act-rehersal/document.module.css';

/*::
import type { Component } from "@lukekaalim/act";
*/

export const WidePage/*: Component<>*/ = ({ children }) => {
  return h('article', { classList: [documentStyles.document, styles.wideDocument] }, children)
}