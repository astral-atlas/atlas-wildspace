// @flow strict

import { proseNodeJSONSerializer, proseSchema, proseStepJSONSerializer } from "@astral-atlas/wildspace-models";
import { h, useEffect, useMemo, useRef } from "@lukekaalim/act"
import { Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { useProseMirrorEditorState, useProseMirrorView } from "../../richText";
import styles from './exposition.module.css';

/*::
import type { Component } from "@lukekaalim/act";
import type { JSONNode } from "prosemirror-model";

export type ExpositionDescriptionProps = {
  rootNode: JSONNode,
  version: number,
}
*/

export const ExpositionDescription/*: Component<ExpositionDescriptionProps>*/ = ({
  rootNode,
  version
}) => {
  const ref = useRef();

  const state = useMemo(() =>
    EditorState.create({ schema: proseSchema, doc: proseNodeJSONSerializer.deserialize(rootNode) }), [rootNode])

  const view = useProseMirrorView(ref, state, { editable: () => false }, [state]);
  useEffect(() => {
    if (!view)
      return;
    const { classList } = view.dom;
    classList.add(styles.expositionDescriptionProsemirrorRoot)
    return () => {
      classList.remove(styles.expositionDescriptionProsemirrorRoot)
    }
  }, [view])


  return h('div', { class: styles.expositionDescription, ref });
}