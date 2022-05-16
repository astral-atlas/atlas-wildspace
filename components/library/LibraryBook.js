// @flow strict
/*::
import type { LibrarySelection } from "./librarySelection";
import type { Component } from "@lukekaalim/act/component";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css';
import seedrandom from 'seedrandom';

/*::
export type LibraryBookProps = {|
  id: string,
  title: string,
  coverURL?: ?string,
  selection?: LibrarySelection,
|};
*/

export const LibraryBook/*: Component<LibraryBookProps>*/ = ({
  id,
  title,
  selection,
  coverURL = null,
}) => {
  const selected = selection && selection.selected.has(id);
  const backgroundImage = coverURL && `url(${coverURL})`;
  const backgroundColor = `hsl(${seedrandom(id)() * 360}, 50%, 50%)`;

  const onClick = (event) => {
    if (!selection)
      return;
    if (event.shiftKey)
      selection.toggle(id);
    else
      selection.replace([id]);
  }

  return h('div', {
    onClick,
    classList: [classes.book, selected && classes.selected],
    style: { backgroundImage, backgroundColor }
  }, [
    h('span', { class: classes.title }, title),
  ]);
}