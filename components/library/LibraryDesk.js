// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act";
import styles from './Library.module.css';

/*::
export type LibraryDeskProps = {

};
*/

export const LibraryDesk/*: Component<>*/ = ({ children }) => {
  return h('div', { class: styles.desk }, children)
};

