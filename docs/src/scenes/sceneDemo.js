// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { SceneContent } from '@astral-atlas/wildspace-models';
import type { SceneContentRenderData, SceneContentBackgroundRenderData } from '@astral-atlas/wildspace-components';
*/
import {
  MiniTheaterCanvas, ProseMirror, prosePlugins,
  SceneContentForegroundRenderer, SceneRenderer, SceneRenderer2,
  useAnimatedKeyedList, useElementKeyboard, useKeyboardTrack,
  createMiniTheaterController2,
  SceneContentEditor,
  createAssetDownloadURLMap,
  useMiniTheaterController2,
  useAsync,
  miniVectorToThreeVector,
  miniQuaternionToThreeQuaternion
} from '@astral-atlas/wildspace-components';
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';

import cityImgURL from './city.jpg';
import riceFieldURL from './rice_field.jpg';
import { useAnimationFrame } from "@lukekaalim/act-three/hooks";
import { useAnimation } from '@lukekaalim/act-curve';
import { LayoutDemo, ScaledLayoutDemo } from "../demo";
import { createMockImageAsset, createMockLibraryData, createMockMiniTheater, createMockMonster, createMockMonsterActor, createMockMonsterPiece, createMockWildspaceClient } from "@astral-atlas/wildspace-test";
import { v4 } from "uuid";
import { createMaskForMonsterActor, emptyRootNode, proseNodeJSONSerializer, proseSchema } from '@astral-atlas/wildspace-models';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { useLibraryMiniTheaterResources } from '@astral-atlas/wildspace-components/miniTheater/resources/libraryResources';

const initialState = EditorState.create({
  schema: proseSchema,
  plugins: [...prosePlugins],
  doc: proseSchema.node("doc", {}, proseSchema.node("paragraph", {}, proseSchema.text("Hello!")))
});

const exampleNode = proseSchema.node("doc", {},
  proseSchema.node("paragraph", {},
    proseSchema.text("Hello!")))

const loudNode = proseSchema.node("doc", {},
  proseSchema.node("paragraph", {},
    proseSchema.text("Hello World!")))

const image = createMockImageAsset();

export const ExpositionSceneDemo/*: Component<>*/ = () => {
  const [library, setLibrary] = useState(createMockLibraryData())

  const miniTheater = library.miniTheaters[0];
  
  const expositionContent = {
    type: 'exposition',
    exposition: {
      background: { type: 'color', color: 'red' },
      subject: { type: 'none' },
      description: {
        version: 0,
        rootNode: exampleNode.toJSON()
      }
    }
  };
  const expositionImageContent = {
    type: 'exposition',
    exposition: {
      background: { type: 'image', assetId: image.description.id },
      subject: { type: 'none' },
      description: {
        version: 0,
        rootNode: exampleNode.toJSON()
      }
    }
  };
  const expositionTheaterContent = {
    type: 'exposition',
    exposition: {
      background: {
        type: 'mini-theater', miniTheaterId: miniTheater.id,
        position: { x: 63.065798892507026, y: 32, z: 18.74563945239002 },
        rotation: { x: -0.35355339059327373, y: 0.35355339059327373, z: 0.1464466094067262, w: 0.8535533905932737 }
      },
      subject: { type: 'none' },
      description: { version: 0, rootNode: exampleNode.toJSON() }
    }
  };
  const miniTheaterContent = {
    type: 'mini-theater',
    miniTheaterId: miniTheater.id,
  };
  const [mode, setMode] = useState('mini-theater')
  const [editableContent, setEditableContent] = useState(expositionContent);

  const content/*: SceneContent*/ = ({
    'mini-theater': miniTheaterContent,
    'exposition': expositionContent,
    'exposition-image': expositionImageContent,
    'exposition-theater': expositionTheaterContent,
    'editable': editableContent
  })[mode] || miniTheaterContent;

  const assets = createAssetDownloadURLMap(library.assets)

  const client = useMemo(() => createMockWildspaceClient(() => library, l => setLibrary(l)), [library]);
  const resources = useLibraryMiniTheaterResources(library)
  const [updates] = useAsync(async () => client.updates.create('gameId'), [client]);

  const miniTheaterId = (
    (content.type === 'mini-theater' && content.miniTheaterId)
    || (content.type === 'exposition' && content.exposition.background.type === 'mini-theater' &&
        content.exposition.background.miniTheaterId)
    || null
  )

  const controller = useMiniTheaterController2(
    miniTheaterId,
    resources,
    updates,
    true,
  )
  const [miniTheaterState, setMiniTheaterState] = useState(null);
  useEffect(() => {
    if (!controller)
      return;
    const { unsubscribe } = controller.subscribe(setMiniTheaterState);
    return () => unsubscribe();
  }, [controller])

  const useContentRenderData = (content)/*: ?SceneContentRenderData*/ => {
    const getBackground = (content)/*: ?SceneContentBackgroundRenderData*/ => {
      switch (content.type) {
        case 'mini-theater':
          if (!miniTheaterState)
            return null;
          return {
            type: 'mini-theater',
            cameraMode: { type: 'interactive', bounds: null },
            controller,
            state: miniTheaterState
          }

        case 'exposition':
          const { background } = content.exposition;
          switch (background.type) {
            case 'image':
              const imageAsset = assets.get(background.assetId);
              if (!imageAsset)
                return null;
              return { type: 'image', imageURL: imageAsset.downloadURL };
            case 'color':
              return { type: 'color', color: background.color }
            case 'mini-theater':
              if (!miniTheaterState)
                return null;
              const position = miniVectorToThreeVector(background.position);
              const quaternion = miniQuaternionToThreeQuaternion(background.rotation);
              return {
                type: 'mini-theater',
                cameraMode: { type: 'fixed', position, quaternion },
                controller: null,
                state: miniTheaterState
              }
            default:
              return null;
          }
        case 'none':
        default:
          return { type: 'color', color: 'white' }
      }
    };
    const getForeground = (content) => {
      switch (content.type) {
        case 'exposition':
          const { description } = content.exposition
          return { type: 'exposition', description: description.rootNode }
        default:
          return { type: 'none' };
      }
    }

    const background = getBackground(content);
    const foreground = getForeground(content);
    if (!background || !foreground) 
      return null;

    return {
      background,
      foreground,
    }
  };

  const sceneContentRenderData = useContentRenderData(content);

  return [
    h('menu', {}, [
      h('button', { onClick: () => setMode('mini-theater') }, 'Mini Theater'),
      h('button', { onClick: () => setMode('exposition') }, 'Color Exposition'),
      h('button', { onClick: () => setMode('exposition-theater') }, 'Theater Exposition'),
      h('button', { onClick: () => setMode('exposition-image') }, 'Theater Image'),
      h('button', { onClick: () => setMode('editable') }, 'Editable'),
    ]),
    sceneContentRenderData ?
      h(ScaledLayoutDemo, { }, [
        h(SceneRenderer2, { sceneContentRenderData })
      ])
      :
      h('pre', {}, JSON.stringify(content)),
  
    h(ScaledLayoutDemo, {}, [
      h(SceneContentEditor, {
        assets,
        client,
        content: editableContent,
        library,
        connection: updates,
        onContentUpdate: c => setEditableContent(c)
      })
    ])
  ]
}

const Anim = ({ enter, exit, key, value }) => {
  const duration = 600;
  const ref = useRef();

  useAnimation((now) => {
    const { current: div } = ref;
    if (!div)
      return;
    
    const enterProgress = Math.min(1, (now - enter) / duration);
    const exitProgress = Math.min(1, exit === -1 ? 0 : (now - exit) / duration);
    const progress = exit === -1 ? enterProgress : Math.min(enterProgress, exitProgress);

    div.style.opacity = Math.min(enterProgress, 1 - exitProgress);
    div.style.height = (Math.min(enterProgress, 1 - exitProgress) * 20) + 'px';
    div.style.display = exitProgress === 1 || enterProgress === 0 ? 'none' : 'block';
  
    if (progress >= 1)
      return true;
  }, [enter, exit])

  return h('div', { ref }, value);
}