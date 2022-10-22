// @flow strict
/*::
import type { Page } from "..";
*/

import { MagicItemEditor, MagicItemRenderer } from '@astral-atlas/wildspace-components';
import { createMockMagicItem } from '@astral-atlas/wildspace-test';
import { h, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';
import { ScaledLayoutDemo } from "../demo";

const MagicItemDemo = () => {
  const [magicItem, setMagicItem] = useState(createMockMagicItem())

  return [
    h(ScaledLayoutDemo, {}, [
      h(MagicItemRenderer, { magicItem }),
    ]),
    h(MagicItemEditor, { magicItem, onMagicItemChange: setMagicItem }),
  ]
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'magic-item':
      return h(MagicItemDemo)
    default:
      return null;
  }
}

export const magicItemPage/*: Page*/ = {
  link: {
    href: '/magic-item',
    children: [],
    name: "Magic Item"
  },
  content: h(Document, {},
    h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const magicItemPages = [
  magicItemPage,
];
