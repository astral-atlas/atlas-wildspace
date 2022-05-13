// @flow strict 
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { WikiDocFocus } from "@astral-atlas/wildspace-models";
import { PluginKey } from "prosemirror-state";
*/

import { Plugin } from 'prosemirror-state';

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
  userId/*: UserID*/,
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
      return {
        update(view) {
          for (const element of elements) {
            const parent = element.parentElement;
            if (parent)
              parent.removeChild(element);
          }
          elements.clear();
          
          const { focus: focusList } = plugin.getState(view.state);
          //const validFocusList = focusList.filter(focus => focus.userId !== userId);
          for (const focus of focusList) {
            const { node: startNode, offset: startOffset } = view.domAtPos(focus.selection.from, +1)
            const { node: endNode, offset: endOffset } = view.domAtPos(focus.selection.to, -1)
            const range = document.createRange();
  
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
  
  
            const rects = range.getClientRects();
            const { body } = document;
            if (!body)
              return;
  
            const viewRect = body.getBoundingClientRect();
            for (const rect of rects) {
              const element = document.createElement('div');
  
              const top = rect.top - viewRect.top;
              const left = rect.left - viewRect.left;
  
              element.style.position = 'absolute';
              element.style.top = `${top}px`;
              element.style.left = `${left}px`;
  
              element.style.width = `${rect.width}px`;
              element.style.height = `${rect.height}px`;
              element.style.border = `2px solid blue`;
  
              element.style.backgroundColor = `red`;
              element.style.opacity = `0.5`;
              element.style.pointerEvents = 'none';
              body.appendChild(element);
              elements.add(element)
            }
          }
        },
        destroy() {
          for (const element of elements) {
            const parent = element.parentElement;
            if (parent)
              parent.removeChild(element);
          }
          elements.clear();

          if (view.hasFocus())
            return;
        }
      }
    }
  });
  return plugin;
};