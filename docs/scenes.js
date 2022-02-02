// @flow strict

import { h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import sceneText from './scenes/index.md?raw'

export const scenesPage = {
  content: h(Document, {}, h(Markdown, { text: sceneText })),
  link: { href: '/scenes', children: [], name: 'Scenes' }
}

export const scenesPages = [
  scenesPage
];
