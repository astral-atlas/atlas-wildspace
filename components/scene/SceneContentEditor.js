// @flow strict

import { emptyRootNode, proseNodeJSONSerializer, proseSchema } from "@astral-atlas/wildspace-models";
import { h, useEffect, useRef, useState } from "@lukekaalim/act"
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { prosePlugins } from "../richText/ProseMirror";
import { v4 } from "uuid";
import {
  EditorForm,
  EditorHorizontalSection,
  SelectEditor,
} from "../editor/form";
import { ExpositionBackgroundEditor } from "./exposition/ExpositionBackgroundEditor";

import styles from './SceneContentEditor.module.css';
import { ExpositionBackgroundRenderer } from "./exposition/ExpositionBackgroundRenderer";

/*::
import type { SceneContent, MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";

export type SceneContentEditorProps = {
  content: SceneContent,
  onContentUpdate: SceneContent => mixed,

  miniTheaters?: $ReadOnlyArray<MiniTheater>,
}
*/

const defaultExposition = {
  type: 'exposition',
  exposition: {
    background: { type: 'color', color: '#ffffff' },
    description: { rootNode: proseNodeJSONSerializer.serialize(emptyRootNode), version: 0 },
    subject: { type: 'none' }
  }
};
export const defaultMiniTheaterContent = {
  type: 'mini-theater',
  miniTheaterId: ''
}

const getDefaultContentForType = (contentType) => {
  switch (contentType) {
    case 'exposition':
      return defaultExposition
    case 'mini-theater':
      return defaultMiniTheaterContent
    default:
    case 'none':
      return { type: 'none' };
  }
}

export const SceneContentEditor/*: Component<SceneContentEditorProps>*/ = ({
  content,
  onContentUpdate,
  miniTheaters = []
}) => {
  const sceneEditorTypeValues = [
    { title: 'None', value: 'none' },
    { title: 'Exposition', value: 'exposition' },
    { title: 'Mini Theater', value: 'mini-theater' },
  ]
  const onContentTypeChange = (contentType) => {
    onContentUpdate(getDefaultContentForType(contentType))
  }

  const onExpositionChange = (exposition) => {
    onContentUpdate({
      type: 'exposition',
      exposition
    })
  }
  const sceneEditor = [
    h(SelectEditor, {
      label: 'Content Type',
      values: sceneEditorTypeValues,
      selected: content.type,
      onSelectedChange: value => onContentTypeChange(value),
    }),
  ]

  return h('div', { class: styles.contentEditor }, [
    content.type === 'exposition' && 
      h(ExpositionEditor, { exposition: content.exposition, onExpositionChange, sceneEditor }),
    content.type === 'none' && [
      h(EditorForm, {}, h(EditorHorizontalSection, {}, sceneEditor)),
      h('div', { class: styles.noneContentEditor }, 'No Content')
    ]
  ]);
}

const ExpositionDescriptionEditor = ({ content, onExpositionUpdate }) => {
  
  const editorRef = useRef();
  
  useEffect(() => {
    if (content.type !== 'exposition')
      return;
    const { exposition } = content;
    const { description } = exposition;
    const rootNode = proseNodeJSONSerializer.deserialize(description.rootNode);
    
    const initialState = EditorState.create({
      schema: proseSchema,
      plugins: [...prosePlugins],
      doc: rootNode
    });
    
    const { current: container } =  editorRef;
    if (!container)
      return;
    const dispatchTransaction = (transaction) => {
      const next = view.state.apply(transaction)
      onExpositionUpdate({
        description: {
          version: description.version + 1,
          rootNode: proseNodeJSONSerializer.serialize(next.doc),
        }
      });
      view.updateState(next)
    }
    const view = new EditorView(container, { state: initialState, dispatchTransaction });

    return () => view.destroy();
  }, [content.type === 'exposition'])

  return h('div', { ref: editorRef });
}