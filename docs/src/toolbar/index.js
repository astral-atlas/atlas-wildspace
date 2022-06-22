// @flow strict
/*::
import type { Page } from "..";
*/

import { EditorForm, EditorRangeInput, ToolbarPalette, ToolbarSwatch } from '@astral-atlas/wildspace-components';
import { h, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';
import {
  createMockImageURL, randomIntRange, repeat,
} from "@astral-atlas/wildspace-test";

const ToolbarPaletteDemo = () => {
  const [toolCount, setToolCount] = useState(5)
  
  const tools = repeat((i) => ({
    type: 'action',
    iconURL: createMockImageURL(`palette:${i}`),
    title: 'Test',

    onAction() {
      alert('CLIK!')
    },
    disabled: i % 2 === 0
  }), toolCount)
  

  return [
    h(EditorForm, {}, [
      h(EditorRangeInput, { label: 'Tools', number: toolCount, onNumberInput: setToolCount, min: 0, max: 10, step: 1 })
    ]),
    h(ToolbarPalette, { tools }),
  ]
}
const ToolbarSwatchDemo = () => {
  return [
    h(ToolbarPalette, { tools: [
      {
        type: 'swatch',
        title: 'Cool',
        iconURL: createMockImageURL(`palette:${0}`),

        tools: repeat(i => ({
          type: 'action',
          title: 'Cool',
          onAction() {
            alert('CLIK!')
          },
          iconURL: createMockImageURL(`palette:${i + 1}`),
        }), 12),
      },
      {
        type: 'action',
        title: 'Cool',
        onAction() {
          alert('CLIK!')
        },
        iconURL: createMockImageURL(`palette:${2}`),
      }
    ] }),
  ]
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'toolbar_palette':
      return h(ToolbarPaletteDemo);
    case 'toolbar_swatch':
      return h(ToolbarSwatchDemo);
    default:
      return null;
  }
}

export const toolbarPage/*: Page*/ = {
  link: {
    href: '/toolbar',
    children: [],
    name: "Toolbar"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const toolbarPages = [
  toolbarPage,
];
