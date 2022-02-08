// @flow strict
/*:: import type { Page } from '@astral-atlas/wildspace-components'; */
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { MarkdownRenderer, renderWorkspacePageContent, TabbedToolbox } from '@astral-atlas/wildspace-components';
import { C } from '@lukekaalim/act-three';

const markdownText = `
### \`usePointerDrag()\`

This hook should let you interact with a element using the mouse, letting you drag around a virtual cursor.

Click and drag on the red square, and you should be able to move the blue square around the screen.
`;

const useMouseDrag = (onDelta/*: ({ x: number, y: number, }) => mixed*/) => {
  const [cursorState, setCursorState] = useState({ moving: false });
  const ref = useRef();
  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    const onPointerMove = (e) => {
      if (cursorState.moving)
        onDelta({ x: e.movementX, y: e.movementY });
    };
    const onPointerDown = (e) => {
      setCursorState(c => ({ ...c, moving: true }));
      e.target.setPointerCapture(e.pointerId);
    }
    const onPointerUp = (e) => {
      setCursorState(c => ({ ...c, moving: false }));
      e.target.releasePointerCapture(e.pointerId);
    }
    const onPointerExit = (e) => {
      setCursorState(c => ({ ...c, moving: false }));
    }
    const onPointerEnter = (e) => {
      setCursorState(c => ({ ...c, moving: false }));
    }
    const onDragStart = (e) => {
      e.preventDefault();
    };
    const onDragEnd = (e) => {
      e.preventDefault();
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointerexit', onPointerExit);
    element.addEventListener('pointerenter', onPointerEnter);
    element.addEventListener('dragstart', onDragStart);
    element.addEventListener('dragend', onDragEnd);
    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointerexit', onPointerExit);
      element.removeEventListener('pointerenter', onPointerEnter);
      element.removeEventListener('dragstart', onDragStart);
      element.removeEventListener('dragend', onDragEnd);
    }
  }, [])
}

const MouseDragWorkspace = ({}) => {
  return [
    renderWorkspacePageContent({
      defaultProps: {},
      renderBench: () => {
        const [mouseState, setMouseState] = useState({ x: 0, y: 0 });
        const [cursorState, setCursorState] = useState({ moving: false, x: 0, y: 0 });
        const ref = useRef();
        useEffect(() => {
          const { current: element } = ref;
          if (!element)
            return;
          const onPointerMove = (e) => {
            const rect = element.getBoundingClientRect();
            setMouseState({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            setCursorState(c => c.moving ? { x: c.x + e.movementX, y: c.y + e.movementY, moving: true } : c);
          };
          const onPointerDown = (e) => {
            setCursorState(c => ({ ...c, moving: true }));
            e.target.setPointerCapture(e.pointerId);
          }
          const onPointerUp = (e) => {
            setCursorState(c => ({ ...c, moving: false }));
            e.target.releasePointerCapture(e.pointerId);
          }
          const onPointerExit = (e) => {
            setCursorState(c => ({ ...c, moving: false }));
          }
          const onPointerEnter = (e) => {
            setCursorState(c => ({ ...c, moving: false }));
          }
          const onDragStart = (e) => {
            e.preventDefault();
          };
          const onDragEnd = (e) => {
            e.preventDefault();
          };

          element.addEventListener('pointermove', onPointerMove);
          element.addEventListener('pointerdown', onPointerDown);
          element.addEventListener('pointerup', onPointerUp);
          element.addEventListener('pointerexit', onPointerExit);
          element.addEventListener('pointerenter', onPointerEnter);
          element.addEventListener('dragstart', onDragStart);
          element.addEventListener('dragend', onDragEnd);
          return () => {
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointerexit', onPointerExit);
            element.removeEventListener('pointerenter', onPointerEnter);
            element.removeEventListener('dragstart', onDragStart);
            element.removeEventListener('dragend', onDragEnd);
          }
        }, [])

        return [
          h('div', { ref, style: { backgroundColor: 'red', height: '256px', width: '256px'}}),
          h('div', { style: {
            position: 'relative',
            transform: `translate(${cursorState.x}px, ${cursorState.y}px)`,
            backgroundColor: 'blue',
            height: '25px',
            width: '25px'
          }}),
          h('pre', {}, JSON.stringify({ mouseState, cursorState }, null, 2))
        ]
      },
      renderTools: () => {
        return h(TabbedToolbox, { tabs: {
          'details.md': h(MarkdownRenderer, { markdownText })
        }})
      }
    })
  ]
};

export const mouseDragPage/*: Page*/ = {
  name: 'usePointerDrag',
  href: '/',
  content: [h(MouseDragWorkspace, {})],
  children: []
}
