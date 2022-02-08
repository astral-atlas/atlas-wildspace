// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */
import { h } from '@lukekaalim/act';

import { Document, Markdown } from "@lukekaalim/act-rehersal";

import controlsText from './controls/index.md?raw';
import styles from './controls/index.module.css';

import { KeyEventDemo } from "./controls/keyEventDemo.js";
import { KeyContextDemo } from "./controls/keyContextDemo.js";
import { KeyStateDemo } from "./controls/keyStateDemo.js";
import { KeyboardTrackDemo } from "./controls/keyTrackDemo.js";
import { useContext, useRef, useState } from "@lukekaalim/act/hooks";
import { intervalContext } from "./controls/context";
import { useAnimation } from "@lukekaalim/act-curve/animation";

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

const ControlsPage = () => {
  const [intervalTime, setIntervalTime] = useState(100);

  return h(Document, {},
    h(intervalContext.Provider, { value: [intervalTime, setIntervalTime] },
      h(Markdown, { text: controlsText, directives })));
};

export const controlsPage/*: Page*/ = {
  content: h(ControlsPage),
  link: { children: [], name: 'Controls', href: '/controls' }
}

export const controlsPages = [
  controlsPage,
];
