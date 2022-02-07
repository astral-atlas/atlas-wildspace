// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { parseMarkdown } from "@lukekaalim/act-markdown";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import sceneText from './scenes/index.md?raw';
import cityImg from './scenes/city.jpg';
import riceImg from './scenes/rice_field.jpg';
import { SceneRenderer } from "./scenes/exposition.js";

import styles from './scenes.module.css';
import { useState } from "@lukekaalim/act/hooks";

const demoLocationText = `
# The Mysterious City

The vast and imposing towers of the white-gold city spires soar and spiral into the sky,
forming a curtain of sunspots and reflective shimmers. The bustling marketplace
dances under the sheets of light, saltstacks and roseglass twirling between fingers.
Even the coins themselves seems to be imbued with a kind of life, almost leaping out of
their purses to join the cataphony of movement and light.
`;

const sceneA = {
  type: 'location',
  name: 'Demo Scene',
  location: {
    content: parseMarkdown(demoLocationText),
    background: { type: 'image', source: cityImg, alternativeText: '' }
  }
};
const sceneB = {
  type: 'location',
  name: 'Rice Field',
  location: {
    content: parseMarkdown(`## Welcome to the rice fields motherfucker`),
    background: { type: 'image', source: riceImg, alternativeText: '' }
  }
}
const sceneC = {
  type: 'location',
  name: 'Nowhere',
  location: null
}
const scenes = [
  sceneA,
  sceneB,
  sceneC
]

const LocationExpositionDemo = () => {
  const [scene, setScene] = useState(sceneC);

  return [
    h('menu', {}, scenes.map(scene =>
      h('button', { onClick: () => setScene(scene) }, scene.name))),
    h('div', { class: styles.demoSceneContainer },
      scene && h(SceneRenderer, { scene }))
  ];
} 

const DemoDirective = ({ node }) => {
  switch (node.attributes.name) {
    case 'location_exposition':
      return h(LocationExpositionDemo);
    default:
      throw new Error(`Unknown Demo Name`);
  }
}

const directives = {
  demo: DemoDirective
};

export const scenesPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: sceneText, directives })),
  link: { href: '/scenes', children: [], name: 'Scenes' }
}

export const scenesPages = [
  scenesPage
];
