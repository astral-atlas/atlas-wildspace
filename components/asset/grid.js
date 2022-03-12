// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
import { h } from "@lukekaalim/act";

import styles from './index.module.css';

/*::
export type AssetGridrops = {
  classList?: string[],
  style?: { [string]: mixed }
}
*/

export const AssetGrid/*: Component<AssetGridItemProps>*/ = ({ children, style }) => {
  return h('ul', { classList: [styles.assetGrid], style }, [
    children
  ]);
};

/*::
export type AssetGridItemProps = {
  classList?: string[],
  style?: { [string]: mixed }
}
*/

export const AssetGridItem/*: Component<AssetGridItemProps>*/ = ({
  children, classList = [], style = {}
}) => {
  return h('li', { classList: [styles.assetGridItem, ...classList], style }, [
    children
  ])
};