// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Node } from "prosemirror-model";
*/

import { prosePlugins, useProseMirrorView } from "./ProseMirror";
import { proseSchema } from "@astral-atlas/wildspace-models";
import { h, useEffect, useMemo, useRef } from "@lukekaalim/act";

import { EditorState } from "prosemirror-state";

/*::
export type RichTextSimpleEditorProps = {
  node: Node,
  onNodeChange?: Node => mixed,
};
*/

export const RichTextSimpleEditor/*: Component<RichTextSimpleEditorProps>*/ = ({
  node,
  onNodeChange
}) => {
  const ref = useRef();

  const state = useMemo(() =>
    EditorState.create({
      schema: proseSchema,
      doc: node,
      plugins: [...prosePlugins]
    }), [node])

  const view = useProseMirrorView(ref, state, {}, []);

  useEffect(() => {
    view && view.setProps({ state });
  }, [state])

  useEffect(() => {
    if (!view || !onNodeChange)
      return;
    const onFocusOut = () => {
      onNodeChange(view.state.doc);
    }
    view.dom.addEventListener('focusout', onFocusOut);
    return () => {
      view.dom.removeEventListener('focusout', onFocusOut);
    }
  }, [view, onNodeChange])

  return h('div', { ref });
}