// @flow strict
/*::
import type { LibrarySelection } from "./librarySelection";
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css'
import {
  EditorForm,
  EditorHorizontalSection,
  EditorTextAreaInput,
  EditorTextInput,
} from "../editor/form";

/*::
export type LibraryFloorProps = {
  header?: ?ElementNode,
  selection?: ?LibrarySelection,
  shelves?: ?ElementNode,
};
*/

export const LibraryFloor/*: Component<LibraryFloorProps>*/ = ({
  header,
  selection,
  shelves,
  children
}) => {
  const onClick = (e) => {
    if (e.target !== e.currentTarget)
      return;
    if (!selection)
      return;
    selection.replace([]);
  };
  return h('div', { onClick, class: classes.floor }, [
    header || null,
    children,
    shelves || null,
  ])
};

/*::
export type LibraryFloorHeaderProps = {
  title?: string,
  filter?: { text: string, onFilterInput: string => mixed }
};
*/

export const LibraryFloorHeader/*: Component<LibraryFloorHeaderProps>*/ = ({
  children,
  title,
  filter,
}) => {
  return h('div', { class: classes.floorHeader }, [
    !!title && h('h2', {}, title),
    !!filter && h(EditorForm, {}, [
      h(EditorHorizontalSection, {}, [
        h(EditorTextInput, {
          label: 'Filter',
          text: filter.text,
          onTextInput: text => filter.onFilterInput(text)
        })
      ])
    ]),
    children,
  ])
};