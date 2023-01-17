// @flow strict

import { proseNodeJSONSerializer, proseSchema, proseStepJSONSerializer } from "@astral-atlas/wildspace-models";
import { h, useEffect, useMemo, useRef } from "@lukekaalim/act"
import { Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { prosePlugins, useProseMirrorEditorState, useProseMirrorView } from "../../richText";
import styles from './exposition.module.css';
import { v4 } from "uuid";

/*::
import type { Component } from "@lukekaalim/act";
import type { ProseMirrorJSONNode } from "prosemirror-model";

export type ExpositionDescriptionProps = {
  description: ProseMirrorJSONNode,
  version: number,
  editable?: boolean,
  onDescriptionUpdate?: (node: ProseMirrorJSONNode, version: number) => mixed,
}
*/

export const ExpositionDescription/*: Component<ExpositionDescriptionProps>*/ = ({
  description,
  version,
  editable = false,
  onDescriptionUpdate = (_, __) => {},
}) => {
  const ref = useRef();

  const state = useMemo(() =>
    EditorState.create({
      schema: proseSchema,
      doc: proseNodeJSONSerializer.deserialize(description),
      plugins: editable ? prosePlugins : []
    }), [description])

  const view = useProseMirrorView(ref, state, {
    editable: () => editable,
  }, [editable]);

  useEffect(() => {
    if (!view)
      return;
    view.setProps({ state });
  }, [state])

  useEffect(() => {
    if (!view)
      return;
    const { classList } = view.dom;
    classList.add(styles.expositionDescriptionProsemirrorRoot)
    return () => {
      classList.remove(styles.expositionDescriptionProsemirrorRoot)
    }
  }, [view])

  useEffect(() => {
    if (!view)
      return;
    const onFocusOut = () => {
      onDescriptionUpdate(view.state.doc.toJSON(), version + 1);
    }
    view.dom.addEventListener('focusout', onFocusOut);
    view.setProps({
      dispatchTransaction: (t) => {
        const n = view.state.apply(t);
        view.updateState(n);
      }
    })
    return () => {
      view.dom.removeEventListener('focusout', onFocusOut);
    }
  }, [view, onDescriptionUpdate])


  return h('div', { class: styles.expositionDescription, ref });
}