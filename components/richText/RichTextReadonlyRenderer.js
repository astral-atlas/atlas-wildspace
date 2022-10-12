// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Node } from "prosemirror-model";
*/

import { useProseMirrorView } from "./ProseMirror";
import { proseSchema } from "@astral-atlas/wildspace-models";
import { h, useEffect, useMemo, useRef } from "@lukekaalim/act";

import { EditorState } from "prosemirror-state";

/*::
export type RichTextReadonlyRendererProps = {
  node: Node
};
*/

export const RichTextReadonlyRenderer/*: Component<RichTextReadonlyRendererProps>*/ = ({
  node
}) => {
  const ref = useRef();

  const state = useMemo(() =>
    EditorState.create({
      schema: proseSchema,
      doc: node,
    }), [node])

  const view = useProseMirrorView(ref, state, {
    editable: () => false,
  }, []);

  useEffect(() => {
    view && view.setProps({ state });
  }, [state])

  return h('div', { ref });
}