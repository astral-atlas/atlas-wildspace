// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */
import { h } from '@lukekaalim/act';

import { Document, Markdown } from "@lukekaalim/act-rehersal";

import controlsText from './controls/index.md?raw';
import keyboardText from './controls/keyboard.md?raw';
import raycastText from './controls/raycast.md?raw';
import gameText from './controls/game.md?raw';
import styles from './controls/index.module.css';

import { KeyEventDemo } from "./controls/keyEventDemo.js";
import { KeyContextDemo } from "./controls/keyContextDemo.js";
import { KeyStateDemo } from "./controls/keyStateDemo.js";
import { KeyboardTrackDemo } from "./controls/keyTrackDemo.js";
import { useContext, useState } from "@lukekaalim/act/hooks";
import { intervalContext } from "./controls/context";
import { FinalDemo } from "./controls/finalDemo";
import { ClickDemo } from './controls/clickDemo';
import { BoardDemo } from './controls/game/boardDemo';

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'events':
      return h(KeyEventDemo);
    case 'context':
      return h(KeyContextDemo);
    case 'state':
      return h(KeyStateDemo);
    case 'track':
      return h(KeyboardTrackDemo);
    case 'final':
      return h(FinalDemo);
    case 'click':
      return h(ClickDemo);
    case 'board':
        return h(BoardDemo);
    default:
      return null;
  }
}
const ControlDemoInvervalInput = () => {
  const [intervalTime, setIntervalTime] = useContext(intervalContext);

  const onInput = (e/*: InputEvent*/) => {
    setIntervalTime((e.target/*: any*/).valueAsNumber);
  }

  return h('label', { class: styles.updateInterval }, [
    h('span', {}, 'Interval milliseconds'),
    h('input', {
      type: 'number', min: 20,
      max: 1000, step: 1, value: intervalTime,
      onInput
    }),
  ])
};

const directives = {
  demo: Demo,
  interval: ControlDemoInvervalInput,
}

const KeyboardControlsPage = () => {
  const [intervalTime, setIntervalTime] = useState(100);

  return h(Document, {},
    h(intervalContext.Provider, { value: [intervalTime, setIntervalTime] },
      h(Markdown, { text: keyboardText, directives })));
};

export const keyboardControlsPage/*: Page*/ = {
  content: h(KeyboardControlsPage),
  link: { children: [], name: 'Keyboard', href: '/controls/keyboard' }
}

export const raycastControlPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: raycastText, directives })),
  link: { children: [], name: 'Raycast', href: '/controls/raycast' }
};
export const gameControlPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: gameText, directives })),
  link: { children: [], name: 'Game', href: '/controls/game' }
};

export const controlsPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: controlsText })),
  link: { children: [
    keyboardControlsPage.link,
    raycastControlPage.link,
    gameControlPage.link
  ], name: 'Controls', href: '/controls' }
}

export const controlsPages = [
  controlsPage,
  raycastControlPage,
  keyboardControlsPage,
  gameControlPage,
];
