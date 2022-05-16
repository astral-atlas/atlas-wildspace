// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";

import type { WikiDoc, WikiDocID, WikiDocUpdate } from "./doc";
import type { WikiDocFocus, WikiDocFocusAction } from "./focus";
*/

import { c } from "@lukekaalim/cast";
import { castWikiDoc, castWikiDocUpdate, castWikiDocId } from "./doc.js";
import { castWikiDocFocus, castWikiDocFocusAction } from "./focus.js";

/*::
export type WikiDocAction =
  | {| type: 'focus', docId: WikiDocID, focus: WikiDocFocusAction |}
  | {| type: 'update', docId: WikiDocID, steps: $ReadOnlyArray<mixed>, version: number, clientId: number |}
  | {| type: 'open', docId: WikiDocID |}
  | {| type: 'close', docId: WikiDocID |}
*/

export const castWikiDocAction/*: Cast<WikiDocAction>*/ = c.or('type', {
  'focus': c.obj({ type: c.lit('focus'), docId: castWikiDocId, focus: castWikiDocFocusAction }),
  'update': c.obj({ type: c.lit('update'), docId: castWikiDocId, steps: c.arr(s => s), version: c.num, clientId: c.num }),
  'open': c.obj({ type: (c.lit('open')/*: Cast<'open'>*/), docId: castWikiDocId }),
  'close': c.obj({ type: (c.lit('close')/*: Cast<'close'>*/), docId: castWikiDocId }),
})