// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
/*::
import type { SelectionActions } from "../editor/selection";
import type { ElementNode } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act";

import styles from './index.module.css';

/*::
export type AssetGridrops = {
  classList?: string[],
  ids?: string[],
  select?: SelectionActions<string>,
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
  classList?: mixed[],
  style?: { [string]: mixed },
  selected?: boolean,
  id?: string,
  background?: ElementNode,
  select?: SelectionActions<string>,
  onClick?: MouseEvent => mixed,
  onDblClick?: MouseEvent => mixed,
  [string]: mixed
}
*/

export const AssetGridItem/*: Component<AssetGridItemProps>*/ = ({
  children,
  selected,
  background,
  classList = [],
  style = {},
  id,
  select,
  ...props
}) => {
  const onClick = (e) => {
    console.log('clicked', select);
    if (select && id) {
      if (e.shiftKey)
        select.add([id])
      else
        select.replace([id])
    }
    props.onClick && props.onClick(e);
  };
  const onDblClick = (e) => {
    props.onDblClick && props.onDblClick(e);
  };
  return h('li', {
    ...props,
    onClick,
    onDblClick,
    classList: [styles.assetGridItem, selected && styles.selected, ...classList],
    style
  }, [
    !!background && h('div', { classList: [styles.assetGridItemBackground] }, background),
    h('div', { classList: [styles.assetGridItemContent] }, [
      children,
    ])
  ])
};