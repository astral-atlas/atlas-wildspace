// @flow strict
/*::
import type { Component, ElementNode } from '@lukekaalim/act';
*/

import { h } from "@lukekaalim/act";
import styles from './window.module.css';

/*::
export type AssetLibraryWindowProps = {
  editor?: ElementNode,
  content?: ElementNode
};
*/

export const AssetLibraryWindow/*: Component<AssetLibraryWindowProps>*/ = ({
  editor,
  content
}) => {
  return h('div', { classList: [styles.assetLibraryWindow] }, [
    h('section', { classList: [styles.assetLibraryWindowContent] }, content),
    h('section', { classList: [styles.assetLibraryWindowEditor] }, editor),
  ]);
}