// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import audioText from './index.md?raw';
import { PlayerDemo } from "./player";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'player':
      return h(PlayerDemo)
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const audioPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: audioText, directives })),
  link: { children: [
    
  ], name: 'Audio', href: '/audio' }
}

export const audioPages/*: Page[]*/ = [
  audioPage,
];