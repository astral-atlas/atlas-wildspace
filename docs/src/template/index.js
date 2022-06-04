// @flow strict
/*::
import type { Page } from "..";
*/

import { h } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    default:
      return null;
  }
}

export const templatePage/*: Page*/ = {
  link: {
    href: '/template',
    children: [],
    name: "Template"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const templatePages = [
  templatePage,
];
