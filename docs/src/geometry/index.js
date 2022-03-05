// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { parseMarkdown } from "@lukekaalim/act-markdown";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import geometryText from './index.md?raw';
import { NineSliceDemo } from "./nineSlice";
import { TilemapDemo } from "./tilemap";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'nine_slice':
      return h(NineSliceDemo)
    case 'tilemap':
      return h(TilemapDemo)
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const geometryPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: geometryText, directives })),
  link: { children: [
    
  ], name: 'Geometry', href: '/geometry' }
}

export const geometryPages/*: Page[]*/ = [
  geometryPage,
];