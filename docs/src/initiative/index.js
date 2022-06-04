// @flow strict
/*::
import type { Page } from "..";
*/

import { h } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';

const TrackerDemo = () => {
  return null;
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'tracker':
      return h(TrackerDemo);
    default:
      return null;
  }
}

export const initiativePage/*: Page*/ = {
  link: {
    href: '/initiative',
    children: [],
    name: "Initiative"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const initiativePages = [
  initiativePage,
];
