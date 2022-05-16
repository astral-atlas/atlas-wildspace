// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css';

/*::
export type LibraryProps = {
  catalogue: ElementNode,
  aisle: ElementNode,
};
*/

export const Library/*: Component<LibraryProps>*/ = ({
  catalogue,
  aisle
}) => {
  return h('div', { className: classes.library }, [
    h('div', { className: classes.leftSidebar }, catalogue),
    aisle,
  ]);
}