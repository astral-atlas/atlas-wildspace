// @flow strict
/*:: import type { Page } from '@astral-atlas/wildspace-components'; */
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { MarkdownRenderer, ReadmePageContent, renderWorkspacePageContent, TabbedToolbox } from '@astral-atlas/wildspace-components';
import { C } from '@lukekaalim/act-three';

import text from './3d.md?raw';

export const threeComponents/*: Page*/ = {
  name: '3D Components',
  href: '/',
  content: [h(ReadmePageContent, { text })],
  children: []
}

