// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
import { h } from "@lukekaalim/act";

import styles from './index.module.css';

/*::
export type AssetGridrops = {
  classList?: string[],
  style?: { [string]: mixed },
  [string]: mixed
}
*/

export const AssetGrid/*: Component<AssetGridItemProps>*/ = ({
  children, style,
  classList = [],
  ...props
}) => {
  return h('ul', { ...props, classList: [styles.assetGrid, ...classList], style }, [
    children
  ]);
};

/*::
export type AssetGridItemProps = {
  classList?: string[],
  style?: { [string]: mixed },
  [string]: mixed
}
*/

export const AssetGridItem/*: Component<AssetGridItemProps>*/ = ({
  children, classList = [], style = {}, ...props
}) => {
  return h('li', { ...props, classList: [styles.assetGridItem, ...classList], style }, [
    children
  ])
};