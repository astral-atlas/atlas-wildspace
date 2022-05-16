// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css';

/*::
export type LibraryAisleProps = {
  floor?: ElementNode,
  desk?: ElementNode,
};
*/

export const LibraryAisle/*: Component<LibraryAisleProps>*/ = ({
  floor,
  desk
}) => {
  return [
    h('div', { class: classes.floor }, floor),
    h('div', { class: classes.desk }, desk),
  ]
};
