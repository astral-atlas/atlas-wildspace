// @flow strict

import { emptyRootNode, proseNodeJSONSerializer, proseSchema } from "@astral-atlas/wildspace-models";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act"
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
import { ExpositionEditor } from "./exposition/ExpositionEditor";

import styles from './SceneContentEditor.module.css';
import { ExpositionBackgroundRenderer } from "./exposition/ExpositionBackgroundRenderer";
import { useLibraryMiniTheaterResources } from "../miniTheater/resources/libraryResources";
import { SceneMiniTheaterRenderer } from "./miniTheater/SceneMiniTheater";
import { useMiniTheaterController2 } from "../miniTheater/useMiniTheaterController2";

/*::
import type { SceneContent, MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { LibraryData } from "../../models/game/library";
import type { AssetDownloadURLMap } from "../asset/map";
import type { WildspaceClient } from "../../client2/wildspace";
import type { UpdatesConnection } from "../../client2/updates";
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

const getDefaultContentForType = (contentType, library) => {
  switch (contentType) {
    case 'exposition':
      return defaultExposition
    case 'mini-theater':
      return { type: 'mini-theater', miniTheaterId: library.miniTheaters[0]?.id }
    default:
    case 'none':
      return { type: 'none' };
  }
}

/*::
export type SceneContentEditorProps = {
  content: SceneContent,
  onContentUpdate: SceneContent => mixed,

  library: LibraryData,
  assets: AssetDownloadURLMap,
  client?: WildspaceClient,
  connection?: ?UpdatesConnection
}
*/

export const SceneContentEditor/*: Component<SceneContentEditorProps>*/ = ({
  content,
  onContentUpdate,
  library,
  assets,
  client,
  connection,
}) => {
  const sceneEditorTypeValues = [
    { title: 'None', value: 'none' },
    { title: 'Exposition', value: 'exposition' },
    { title: 'Mini Theater', value: 'mini-theater' },
  ]
  const onContentTypeChange = (contentType) => {
    onContentUpdate(getDefaultContentForType(contentType, library))
  }

  const onExpositionChange = (exposition) => {
    onContentUpdate({
      type: 'exposition',
      exposition
    })
  }
  const onMiniTheaterChange = (miniTheaterId) => {
    onContentUpdate({
      type: 'mini-theater',
      miniTheaterId
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
      h(ExpositionEditor, {
        editorPrefixElement: sceneEditor,
        exposition: content.exposition,
        onExpositionChange, 
        library, assets, client
      }),
    content.type === 'mini-theater' &&
      h(EditorSceneMiniTheater, {
        editorPrefixElement: sceneEditor,
        miniTheaterId: content.miniTheaterId,
        onMiniTheaterChange,
        library,
        assets,
        client,
        connection
      }),
    content.type === 'none' && [
      h(EditorForm, {}, h(EditorHorizontalSection, {}, sceneEditor)),
      h('div', { class: styles.noneContentEditor }, 'No Content')
    ]
  ]);
}

const EditorSceneMiniTheater = ({
  miniTheaterId,
  library,
  assets,
  client,
  onMiniTheaterChange,
  editorPrefixElement = null,
  connection = null,
}) => {
  const miniTheaterValues = library.miniTheaters.map(m => {
    return {
      title: m.name,
      value: m.id,
    };
  })
  const onSelectedChange = (miniTheaterId) => {
    onMiniTheaterChange(miniTheaterId)
  }
  
  return h('div', {}, [
    h(EditorForm, {}, [
      h(EditorHorizontalSection, {}, [
        editorPrefixElement,
        h(SelectEditor, {
          label: 'Mini Theater',
          values: miniTheaterValues,
          selected: miniTheaterId,
          onSelectedChange
        })
      ])
    ]),
    connection && h(ConnectedTheater, { library, miniTheaterId, connection })
  ])
}

const ConnectedTheater = ({
  library,
  miniTheaterId,
  connection
}) => {
  const resources = useLibraryMiniTheaterResources(library);
  const controller = useMiniTheaterController2(miniTheaterId, resources, connection, true);

  if (!controller)
    return null;
  
  const [miniTheaterState, setMiniTheaterState] = useState(controller.getState());
  useEffect(() => {
    const { unsubscribe } = controller.subscribe(setMiniTheaterState);
    return () => unsubscribe();
  }, [controller]);

  return h(SceneMiniTheaterRenderer, {
    state: miniTheaterState,
    controller,
    cameraMode: { type: 'interactive', bounds: null },
  });
}