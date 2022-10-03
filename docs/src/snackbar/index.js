// @flow strict
/*::
import type { Page } from "..";
*/

import { SnackbarControl, useAsync, useGameConnection, useLibraryMiniTheaterResources, useMiniTheaterController2, useMiniTheaterState } from '@astral-atlas/wildspace-components';
import { h, useMemo, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { ScaledLayoutDemo } from '../demo';

import indexText from './index.md?raw';
import { WidePage } from "../page";
import { MiniTheaterSnackbarControl } from '@astral-atlas/wildspace-components/snackbar/MiniTheaterSnackbarControl';
import { createMockGame, createMockLibraryData, createMockWildspaceClient } from '@astral-atlas/wildspace-test';

const SnackbarDemo = () => {
  const library = useMemo(() => createMockLibraryData(), []);
  const client = useMemo(() => createMockWildspaceClient(() => library, () => {}), []);
  const resources = useLibraryMiniTheaterResources(library)
  const miniTheater = library.miniTheaters[0];
  const [updates] = useAsync(async () => client.updates.create('0'), [])
  
  const controller = useMiniTheaterController2(miniTheater.id, resources, updates, true);
  const state = useMiniTheaterState(controller);

  return [
    h(ScaledLayoutDemo, { style: { background: 'center / cover url("/tunnel.jpg")', } }, [
      !!controller && !!state && h(MiniTheaterSnackbarControl, { controller, state })
    ]),
    h('code', {}, h('pre', {}, JSON.stringify(state, null, 2)))
  ]
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'snackbar':
      return h(SnackbarDemo)
    default:
      return null;
  }
}

export const snackbarPage/*: Page*/ = {
  link: {
    href: '/snackbar',
    children: [],
    name: "Snackbar"
  },
  content: h(WidePage, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const snackbarPages = [
  snackbarPage,
];
