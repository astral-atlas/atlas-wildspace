// @flow strict
/*::
import type { Page } from "..";
*/

import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';
import { ScaledLayoutDemo } from "../demo";
import {
  FreeCamera, RenderCanvas, useChildObject, usePostProcessRenderSetup
} from '@astral-atlas/wildspace-components';
import { GridHelperGroup } from '../controls/helpers';

import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { randomBox3, repeat } from '@astral-atlas/wildspace-test';
import { Box3Helper, BufferAttribute, BufferGeometry, Points } from "three";
import { useDisposable, points } from '@lukekaalim/act-three';

const BoxHelper = ({ ref, box }) => {
  useChildObject(ref, () => new Box3Helper(box), [box]);
  return null;
}

const RenderDemo = () => {
  const calculateRandomBoxes = () => {
    return repeat(() => randomBox3(), 1000)
  }
  const [boxes, setBoxes] = useState(() => calculateRandomBoxes())
  const sceneRef = useRef();

  const geometry = useDisposable(() => new BufferGeometry(), [])
  useEffect(() => {
    const positions = new Float32Array(3 * 1000 * 10);
    let i = 0;
    for (const position of positions) {
      positions[i] = (Math.random() - 0.5) * 60;
      i++;
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
  }, [boxes])

  return [
    h('button', { onClick: () => setBoxes(calculateRandomBoxes()) }, 'Reroll Boxes'),
    h(ScaledLayoutDemo, {}, [
      h(RenderCanvas, {
        renderSetupOverrides: {
          sceneRef,
        },
        canvasProps: {
          style: { position: 'absolute', width: '100%', height: '100%' }
        }
      }, [
        h(points, { geometry }),
        h(FreeCamera, { }),
        h(GridHelperGroup),
        boxes.map(box => h(BoxHelper, { box, ref: sceneRef }))
      ])
    ])
  ];
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'render_demo':
      return h(RenderDemo);
    default:
      return null;
  }
}

export const renderPage/*: Page*/ = {
  link: {
    href: '/render',
    children: [],
    name: "Render"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const renderPages = [
  renderPage,
];
