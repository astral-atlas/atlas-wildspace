// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";

import type { WikiDoc, WikiDocID } from "./doc";
import type { WikiDocFocus, WikiDocFocusAction } from "./focus";
*/

import { c } from "@lukekaalim/cast";
import { castWikiDocFocus, castWikiDocFocusAction } from "./focus.js";

/*::
export type WikiDocAction =
  | {| type: 'focus', focus: WikiDocFocusAction |}
  | {| type: 'update',steps: $ReadOnlyArray<mixed>, version: number, clientId: number |}
*/

export const castWikiDocAction/*: Cast<WikiDocAction>*/ = c.or('type', {
  'focus': c.obj({ type: c.lit('focus'), focus: castWikiDocFocusAction }),
  'update': c.obj({ type: c.lit('update'), steps: c.arr(s => s), version: c.num, clientId: c.num }),
})