// @flow strict
/*::
import type { Page } from "..";
*/

import { TerrainEditor } from '@astral-atlas/wildspace-components';
import { h, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { useDisposable } from '@lukekaalim/act-three';

import indexText from './index.md?raw';
import { BoxGeometry, Mesh } from "three";
import { v4 } from "uuid";
import { createMockShape, createMockTerrainProp } from '@astral-atlas/wildspace-test';
import { ScaledLayoutDemo } from '../demo';

const geometry = new BoxGeometry(10, 10, 10);
const exampleCube = new Mesh(geometry);

const TerrainEditorDemo = () => {
  const [terrainProp, setTerrainProp] = useState(createMockTerrainProp())
  const modelResourceObject = exampleCube;
 
  return h(ScaledLayoutDemo, { style: { display: 'flex' }}, [
    h(TerrainEditor, { modelResourceObject, terrainProp, onTerrainPropChange: setTerrainProp })
  ])
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
