// @flow strict

/*::
import type { WikiDocConnection } from "./connection";
import type { WikiDoc } from "./doc";
import type { WikiDocEvent } from "./events";
import type { WikiDocFocus } from "./focus";
import type { Cast } from "@lukekaalim/cast";
*/
import { c } from "@lukekaalim/cast";

import { castWikiDoc } from "./doc.js";
import { castWikiDocFocus } from "./focus.js";
import { castWikiDocConnection } from "./connection.js";
import { applyRichTextUpdate } from "./richText.js";

/*::
export type WikiDocState = {
  doc: WikiDoc,
  focus: $ReadOnlyArray<WikiDocFocus>,
  connections: $ReadOnlyArray<WikiDocConnection>,
}
*/

export const reduceWikiDocStateEvent = (
  state/*: WikiDocState*/,
  event/*: WikiDocEvent*/,
)/*: WikiDocState*/ => {
  switch (event.type) {
    case 'connect':
      return {
        ...state,
        connections: [...state.connections, event.connection]
      }
    case 'disconnect':
      return {
        ...state,
        connections: state.connections.filter(c => c.gameConnectionId !== event.connectionId),
        focus: state.focus.filter(f => f.connectionId === event.connectionId)
      };
    case 'update':
      return { ...state, doc: { ...state.doc, content: applyRichTextUpdate(state.doc.content, event.update)} };
    case 'focus':
      return { ...state, focus: [...new Map([...state.focus, event.focus].map(f => [f.connectionId, f])).values()] }
    default:
      return state;
  }
}

export const castWikiDocState/*: Cast<WikiDocState>*/ = c.obj({
  doc: castWikiDoc,
  focus: c.arr(castWikiDocFocus),
  connections: c.arr(castWikiDocConnection),
});
