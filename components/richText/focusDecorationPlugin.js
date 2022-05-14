// @flow strict 
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { WikiDocFocus, GameConnectionID } from "@astral-atlas/wildspace-models";
import { PluginKey } from "prosemirror-state";
*/

import { Plugin } from 'prosemirror-state';
import seedrandom from 'seedrandom';

/*::
export type FocusDecorationState = {
  to: number,
  from: number,
  focus: $ReadOnlyArray<WikiDocFocus>,
}
export type FocusDecorationMeta = $ReadOnlyArray<WikiDocFocus>
*/

export const createFocusDecorationPlugin = (
  onFocusChange/*: (from: number, to: number) => mixed*/, 
  connectionId/*: ?GameConnectionID*/ = null,
  key/*: ?PluginKey<FocusDecorationMeta>*/ = null,
)/*: Plugin<FocusDecorationState, FocusDecorationMeta>*/ => {

  const plugin = new Plugin/*:: <FocusDecorationState, FocusDecorationMeta>*/({
    key,
    state: {
      init() {
        return { focus: [], to: 0, from: 0 }
      },
      apply(tr, pluginState, prev, next) {
        const from = next.selection.from;
        const to = next.selection.to;
        if (prev.selection.from !== from || prev.selection.to !== to) {
          onFocusChange(from, to);
        }
        return { focus: tr.getMeta(plugin) || pluginState.focus, to, from }
      }
    },
    view: (view) => {
      const elements = new Set();

      const clearFocuses = () => {
        for (const element of elements) {
          const parent = element.parentElement;
          if (parent)
            parent.removeChild(element);
        }
        elements.clear();
      }
      const drawArea = (rect, viewRect, parent, hue) => {
        const element = document.createElement('div');

        const top = rect.top - viewRect.top;
        const left = rect.left - viewRect.left;

        element.style.position = 'absolute';
        element.style.top = `${top}px`;
        element.style.left = `${left}px`;

        element.style.width = `${rect.width}px`;
        element.style.height = `${rect.height}px`;

        element.style.backgroundColor = `hsl(${hue}deg, 50%, 50%)`;
        element.style.opacity = `0.5`;
        element.style.pointerEvents = 'none';
        parent.appendChild(element);
        elements.add(element)
      }
      const drawCursor = (coords, hue, parent, viewRect) => {
        const element = document.createElement('div');

        const top = coords.top - viewRect.top;
        const left = coords.left - viewRect.left;

        element.style.position = 'absolute';
        element.style.top = `${top}px`;
        element.style.height = `${coords.bottom - coords.top}px`;

        element.style.left = `${left-1}px`;
        element.style.width = `3px`

        element.style.backgroundColor = `hsl(${hue}deg, 75%, 30%)`;
        element.style.opacity = `0.5`;
        element.style.pointerEvents = 'none';
        parent.appendChild(element);
        elements.add(element)
      }
      const drawFocus = (focus) => {
        const parent = view.dom.parentElement;
        if (!parent)
          return;
        const viewRect = parent.getBoundingClientRect();

        const hue = seedrandom(focus.connectionId)() * 360;

        if (focus.selection.from === focus.selection.to) {
          const coords = view.coordsAtPos(focus.selection.from, 1);
          drawCursor(coords, hue, parent, viewRect);
        } else {
          const { node: startNode, offset: startOffset } = view.domAtPos(focus.selection.from, -1)
          const { node: endNode, offset: endOffset } = view.domAtPos(focus.selection.to, -1)
  
          const range = document.createRange();
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          const rangeRects = range.getClientRects();
  
          for (const rect of rangeRects)
            drawArea(rect, viewRect, parent, hue)
        }
      }
      const draw = () => {
        const { focus: focusList } = plugin.getState(view.state);
        for (const focus of focusList.filter(f => f.connectionId !== connectionId))
          drawFocus(focus);
      }

      draw();

      return {
        update(view) {
          clearFocuses();
          draw();
        },
        destroy() {
          clearFocuses();
        }
      }
    }
  });
  return plugin;
};