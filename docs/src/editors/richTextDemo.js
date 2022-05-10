// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
*/
import { ProseMirror, useProseMirrorEditorState, prosePlugins } from "@astral-atlas/wildspace-components";
import { proseSchema } from "@astral-atlas/wildspace-models";
import { h, useMemo, useState } from "@lukekaalim/act";
import { Decoration, DecorationSet } from 'prosemirror-view';
import { EditorState, Plugin } from "prosemirror-state";
import debounce from 'lodash.debounce';


const plugins = [
  ...prosePlugins,
  testDecorationPlugin()
]


export const ProseMirrorDemo/*: Component<>*/ = () => {
  const [stateA, dispatchA] = useProseMirrorEditorState(() => EditorState.create({ schema: proseSchema, plugins }))
  const [stateB, dispatchB] = useProseMirrorEditorState(() => EditorState.create({ schema: proseSchema, plugins }))


  return [
    h(ProseMirror, { state: stateA, dispatchTransaction: dispatchA }),
    h(ProseMirror, { state: stateB, dispatchTransaction: dispatchB }),
  ];
}