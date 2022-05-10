// @flow strict
/*::
import type { WikiDoc, WikiDocID, WikiDocUpdate } from "./doc";
import type { WikiDocFocus, WikiDocFocusAction } from "./focus";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castWikiDoc, castWikiDocUpdate, castWikiDocId } from "./doc.js";
import { castWikiDocFocus, castWikiDocFocusAction } from "./focus.js";

/*::
export type WikiDocEvent =
  | {| type: 'focus', docId: WikiDocID, focus: WikiDocFocus |}
  | {| type: 'update', docId: WikiDocID, update: WikiDocUpdate |}
  | {| type: 'load', doc: WikiDoc, focus: $ReadOnlyArray<WikiDocFocus> |}
*/

export const castWikiDocEvent/*: Cast<WikiDocEvent>*/ = c.or('type', {
  'focus': c.obj({ type: c.lit('focus'), docId: castWikiDocId, focus: castWikiDocFocus }),
  'update': c.obj({ type: c.lit('update'), docId: castWikiDocId, update: castWikiDocUpdate }),
  'load': c.obj({ type: c.lit('load'), doc: castWikiDoc, focus: c.arr(castWikiDocFocus) }),
})