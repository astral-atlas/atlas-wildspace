// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import assetText from './index.md?raw';
import { AssetGridDemo } from "./assetGrid.js";
import { audioPage, audioPages } from "./audio";
import { assetScenePage, assetScenePages } from "./scene";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'assetGrid':
      return h(AssetGridDemo)
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const assetPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: assetText, directives })),
  link: { children: [
    audioPage.link,
    assetScenePage.link,
  ], name: 'Assets', href: '/assets' }
}

export const assetPages/*: Page[]*/ = [
  assetPage,
  ...audioPages,
  ...assetScenePages
];