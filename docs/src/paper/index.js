// @flow strict
/*::
import type { Page } from "..";
*/

import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { h } from "@lukekaalim/act";

import paperText from './index.md?raw';
import { MagicItemCardDemo } from "./MagicItemCardDemo";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'magicItemCard':
      return h(MagicItemCardDemo);
  }
  return null;
}

const directives = {
  'demo': Demo
}

export const paperPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: paperText, directives })),
  link: { children: [], name: 'Paper', href: '/paper' }
};

export const paperPages = [
  paperPage,
];
