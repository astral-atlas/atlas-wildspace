// @flow strict
/*:: import type { Page } from '@astral-atlas/wildspace-components'; */
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { MarkdownRenderer, renderWorkspacePageContent, TabbedToolbox } from '@astral-atlas/wildspace-components';
import { C } from '@lukekaalim/act-three';

import hookStyles from './hooks.module.css';

const markdownText = `
### \`useKeyboard()\`

This hook should let you interact with a element using the mouse, letting you drag around a virtual cursor.

Click and drag on the red square, and you should be able to move the blue square around the screen.
`;

const Bench = () => {
  const ref = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;

    element.addEventListener('click', () => {
      element.focus();
    });
    element.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowDown':
          e.preventDefault();
          setPosition(p => ({ ...p, y: p.y + 1}))
          return;
        case 'ArrowUp':
          e.preventDefault();
          setPosition(p => ({ ...p, y: p.y - 1}))
          return;
        case 'ArrowLeft':
          e.preventDefault();
          setPosition(p => ({ ...p, x: p.x - 1}))
          return;
        case 'ArrowRight':
          e.preventDefault();
          setPosition(p => ({ ...p, x: p.x + 1}))
          return;
      }
    });
  }, [])

  return [
    h('div', { className: hookStyles.focusTarget, ref, tabindex: '0' }),
    h('div', { style: { height: '20px', width: '20px', backgroundColor: 'green', transform: `translate(${position.x * 10}px, ${position.y * 10}px)` } }),
    h('pre', {}, JSON.stringify(position, null, 2))
  ];
}

const KeyboardWorkspace = () => {
  return [
    renderWorkspacePageContent({
      defaultProps: {},
      renderBench: () => h(Bench),
      renderTools: () => null,
    })
  ];
}

export const keyboardPage/*: { }*/ = {
  name: 'useKeyboardControls',
  href: '/',
  content: [h(KeyboardWorkspace, {})],
  children: []
};