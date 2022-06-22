// @flow strict
/*::
import type { Page } from "..";
*/

import { MenuGameColumn, MenuGameIdEditor } from '@astral-atlas/wildspace-components';
import { createMockGame, repeat } from '@astral-atlas/wildspace-test';
import { h, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { ScaledLayoutDemo } from '../demo';

import indexText from './index.md?raw';

const ColumnDemo = () => {
  return h(ScaledLayoutDemo, {}, [
    h(MenuGameColumn, {}, [
      h('div', {}, 'Column Content A'),
      h('div', {}, 'Column Content B'),
    ])
  ]);
}

const GameIdDemo = () => {
  const games = repeat(() => createMockGame(), 5);
  const [selectedGameId, onSelectedGameChange] = useState(games[0].id);

  return h(ScaledLayoutDemo, { style: { backgroundColor: 'black' } }, [
    h(MenuGameIdEditor, { games, onSelectedGameChange, selectedGameId })
  ])
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'column':
      return h(ColumnDemo);
    case 'gameId':
      return h(GameIdDemo);
    default:
      return null;
  }
}

export const mainMenuPage/*: Page*/ = {
  link: {
    href: '/main-menu',
    children: [],
    name: "Main Menu"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const mainMenuPages = [
  mainMenuPage,
];
