// @flow strict
/*::
import type { LibraryBookProps } from "./LibraryBook";
import type { LibrarySelection } from "./librarySelection";
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";

import classes from './Library.module.css';
import { LibraryBook } from "./LibraryBook";

/*::
export type LibraryShelfProps = {
  selection?: LibrarySelection,
  title?: ?string,
  books?: $ReadOnlyArray<{|
    id: string,
    coverURL?: ?string,
    title: string
  |}>,
};
*/

export const LibraryShelf/*: Component<LibraryShelfProps>*/ = ({
  selection,
  title,
  books = [],
}) => {
  const onDblClick = (e) => {
    if (!selection)
      return;
    selection.replace(books.map(b => b.id));
  };
  const onClick = (e) => {
    if (!selection)
      return;
    if (e.currentTarget !== e.target)
      return;
    selection.replace([]);
  }
  if (books.length < 1)
    return null;

  return h('section', {
    className: classes.shelf,
    onDblClick,
    onClick,
  }, [
    !!title && h('h3', { className: classes.title, onClick }, title),
    h('ul', { className: classes.booksGrid, onClick },
      books.map(book => h('li', {},
        h(LibraryBook, {
          selection,
          id: book.id,
          title: book.title,
          coverURL: book.coverURL
        }))))
  ]);
}