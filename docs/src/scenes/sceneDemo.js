// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {  } from '@astral-atlas/wildspace-models';
*/
import {
  MiniTheaterCanvas, ProseMirror, prosePlugins,
  SceneContentForegroundRenderer, SceneRenderer, SceneRenderer2,
  useAnimatedKeyedList, useElementKeyboard, useKeyboardTrack,
  createMiniTheaterController2,
  SceneContentEditor
} from '@astral-atlas/wildspace-components';
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';

import cityImgURL from './city.jpg';
import riceFieldURL from './rice_field.jpg';
import { useAnimationFrame } from "@lukekaalim/act-three/hooks";
import { useAnimation } from '@lukekaalim/act-curve';
import { LayoutDemo } from '../demo';
import { createMockImageAsset, createMockMiniTheater, createMockMonster, createMockMonsterActor, createMockMonsterPiece, createMockWildspaceClient } from "@astral-atlas/wildspace-test";
import { v4 } from "uuid";
import { createMaskForMonsterActor, emptyRootNode, proseSchema } from '@astral-atlas/wildspace-models';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";

const initialState = EditorState.create({
  schema: proseSchema,
  plugins: [...prosePlugins],
  doc: proseSchema.node("doc", {}, proseSchema.node("paragraph", {}, proseSchema.text("Hello!")))
});

const image = createMockImageAsset();

export const ExpositionSceneDemo/*: Component<>*/ = () => {
  const editorRef = useRef();
  const [editorState, setEditorState] = useState(initialState)
  useEffect(() => {
    const { current: container } =  editorRef;
    if (!container)
      return;
    const dispatchTransaction = (transaction) => {
      const next = view.state.apply(transaction)
      setEditorState(next);
      view.updateState(next)
    }
    const view = new EditorView(container, { state: initialState, dispatchTransaction });

    setEditorState(initialState);
    return () => view.destroy();
  }, [])

  const expositionContent = {
    type: 'exposition',
    exposition: {
      background: { type: 'color', color: 'red' },
      subject: { type: 'none' },
      description: {
        version: 0,
        rootNode: editorState.doc.toJSON()
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
        rootNode: editorState.doc.toJSON()
      }
    }
  };
  const [fixedTransform, setFixedTransform] = useState({
    position: { x: 63.065798892507026, y: 32, z: 18.74563945239002 },
    rotation: { x: -0.35355339059327373, y: 0.35355339059327373, z: 0.1464466094067262, w: 0.8535533905932737 }
  })
  const expositionTheaterContent = {
    type: 'exposition',
    exposition: {
      background: {
        type: 'mini-theater', miniTheaterId: '0',
        ...fixedTransform,
      },
      subject: { type: 'none' },
      description: { version: 0, rootNode: editorState.doc.toJSON() }
    }
  };
  const miniTheaterContent = {
    type: 'mini-theater',
    miniTheaterId: '0',
  };
  const [mode, setMode] = useState('mini-theater')
  const [editingSceneContent, setEditingSceneContent] = useState(expositionImageContent);
  const onContentUpdate = (content) => {
    console.log(content);
    setEditingSceneContent(content)
  };
  const content = ({
    'mini-theater': miniTheaterContent,
    'exposition': expositionContent,
    'exposition-image': expositionImageContent,
    'exposition-theater': expositionTheaterContent,
    'editable': editingSceneContent,
  })[mode] || miniTheaterContent

  const monsterIcon = createMockImageAsset();
  const monster = createMockMonster({ initiativeIconAssetId: monsterIcon.description.id })
  const monsterActor = createMockMonsterActor(monster)
  const monsterPiece = createMockMonsterPiece(monsterActor.id);
  const miniTheater = createMockMiniTheater([monsterPiece]);

  const miniTheaterResources = {
    assets: new Map([
      [monsterIcon.description.id, monsterIcon]
    ]),
    monsterMasks: new Map([
      [monsterActor.id, createMaskForMonsterActor(monster, monsterActor)]
    ]),
    characters: new Map(),
    meshMap: new Map(),
    textureMap: new Map(),
  };

  const overrideCanvasRef = useRef();
  const overrideCameraRef = useRef();
  const emitter = useElementKeyboard(overrideCanvasRef);
  const keys = useKeyboardTrack(emitter);
  const miniTheaterController = useMemo(() => {
    return createMiniTheaterController2(miniTheaterResources, miniTheater, () => console.log, true)
  }, [])
  const assets = useMemo(() => {
    return new Map([
      [image.description.id, image]
    ])
  }, [])

  return [
    h('menu', {}, [
      h('button', { onClick: () => setMode('mini-theater') }, 'Mini Theater'),
      h('button', { onClick: () => setMode('exposition') }, 'Color Exposition'),
      h('button', { onClick: () => setMode('exposition-theater') }, 'Theater Exposition'),
      h('button', { onClick: () => setMode('exposition-image') }, 'Theater Image'),
      h('button', { onClick: () => setMode('editable') }, 'Editable'),
    ]),
    h(LayoutDemo, { }, [
      h(SceneRenderer2, { content, miniTheaterController, assets })
    ]),
    h(SceneContentEditor, { content: editingSceneContent, onContentUpdate }),
    h('menu', {}, [
      h('button', { onClick: () => {
        const { current: camera } = overrideCameraRef;
        if (!camera)
          return;
        setFixedTransform({
          position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          },
          rotation: {
            x: camera.quaternion.x,
            y: camera.quaternion.y,
            z: camera.quaternion.z,
            w: camera.quaternion.w,
          }
        })
      } }, 'Save'),
    ]),
    h(MiniTheaterCanvas, {
      mode: { type: 'free-cam', keys },
      overrideCanvasRef,
      overrideCameraRef,
      miniTheater,
      resources: miniTheaterResources
    }),
    h('div', { ref: editorRef })
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