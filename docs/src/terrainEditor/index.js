// @flow strict
/*::
import type { Page } from "..";
import type { TerrainProp } from "@astral-atlas/wildspace-models";
*/

import { createMiniTheaterAssetResourceLoader, TerrainNodeTree, TerrainPropEditor, useTerrainEditorData } from '@astral-atlas/wildspace-components';
import { h, useMemo, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { useDisposable } from '@lukekaalim/act-three';

import indexText from './index.md?raw';
import {
  BoxGeometry, SphereGeometry, ConeGeometry,
  Mesh, Quaternion
} from "three";
import { v4 } from "uuid";
import { createMockModelResource, createMockShape, createMockTerrainProp, randomElement, randomName, randomObjectName, repeat } from '@astral-atlas/wildspace-test';
import { ScaledLayoutDemo } from '../demo';
import { NodeRow, NodeTree } from '@astral-atlas/wildspace-components/terrain/snackbar/tree';
import { Sidebar } from '@astral-atlas/wildspace-components/terrain/sidebar/Sidebar';
import { Overlay } from '@astral-atlas/wildspace-components/terrain/sidebar/Overlay';

const geometry = new BoxGeometry(10, 10, 10);

const exampleCube = new Mesh(geometry);
const exampleSphere = new Mesh(new SphereGeometry(10));
const exampleCone = new Mesh(new ConeGeometry(5, 20, 32))

const randomModel = () => {
  return randomElement([
    exampleCube,
    exampleSphere,
    exampleCone,
  ]);
};

const TerrainEditorDemo = () => {

  const modelResources = useMemo(() =>
    repeat(() => createMockModelResource(), 8), []);
  
  const objectMap = useMemo(() =>
    new Map(modelResources.map(r => [r.assetId, randomModel()])), []);


  const [terrainProp, setTerrainProp] = useState/*:: <TerrainProp>*/({
    ...createMockTerrainProp(),
    nodes: [
      { type: 'model',
        meta: { id: '000', name: randomObjectName(), path: ['001', '000'] },
        modelId: randomElement(modelResources).id,
        path: [] },
      { type: 'model',
        meta: { id: '002', name: randomObjectName(), path: ['002'] },
        modelId: randomElement(modelResources).id,
        path: [] },
      { type: 'transform',
        meta: { id: '001', name: randomObjectName(), path: ['001'] },
        position: { x: 20, y: 0, z: 0 },
        quaternion: { ...new Quaternion().identity() },
        children: ['000']
      },
    ],
    rootNodes: ['001', '002'],
  })

  const resources = {
    assets: new Map(),

    characters: new Map(),
    monsterMasks: new Map(),

    loadingAssets: false,
    loadingProgress: 1,

    modelResources: new Map(modelResources.map(m => [m.id, m])),

    materialMap: new Map(),
    objectMap,
    textureMap: new Map(),
    terrainProps: new Map([[terrainProp.id, terrainProp]])
  };

  const terrainEditorData = useTerrainEditorData(terrainProp, resources, setTerrainProp);
 
  return [
    h(ScaledLayoutDemo, {}, [
      h(TerrainPropEditor, {
        terrainProp,
        resources,
        onTerrainPropChange: setTerrainProp
      })
    ]),
    h(TerrainNodeTree, { terrainProp, terrainEditorData }),

    h(NodeRow, {
      node: {
        type: 'model',
        meta: { id: '000', name: randomObjectName(), path: ['001', '000'] },
        modelId: randomElement(modelResources).id,
        path: [] },
      editor: terrainEditorData }),
    h('br'),
    h(NodeTree, {
      editor: terrainEditorData,
    }),
    h('br'),
    h('br'),
    h(Sidebar, {
      editor: terrainEditorData 
    }),
    h('br'),
    h('br'),
    h(ScaledLayoutDemo, {}, [
      h(Overlay, { editor: terrainEditorData }),
    ]),
    h('pre', {}, JSON.stringify(terrainProp, null, 2)),
  ]
};

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'terrain-editor':
      return h(TerrainEditorDemo)
    default:
      return null;
  }
}

export const terrainEditorPage/*: Page*/ = {
  link: {
    href: '/terrain-editor',
    children: [],
    name: "Terrain Editor"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const terrainEditorPages = [
  terrainEditorPage,
];
