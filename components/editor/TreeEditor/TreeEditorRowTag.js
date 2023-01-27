// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
/*::
export type TreeEditorRowTagProps = {
  tagName: string,
  tagColor: string,
};
*/

import { h } from "@lukekaalim/act";
import styles from './TreeEditorRow.module.css';

export const TreeEditorRowTag/*: Component<TreeEditorRowTagProps>*/ = ({
  tagName,
}) => {
  return h('span', { class: styles.tag }, tagName);
};