// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css';

/*::
export type LibraryAisleProps = {
  floor?: ElementNode,
  desk?: ?ElementNode,
  wideDesk?: boolean
};
*/

export const LibraryAisle/*: Component<LibraryAisleProps>*/ = ({
  floor,
  desk,
  wideDesk = false
}) => {
  return [
    h('div', { class: classes.floor }, floor),
    !!desk && h('div', { classList: [classes.desk, wideDesk && classes.wide] }, desk),
  ]
};
