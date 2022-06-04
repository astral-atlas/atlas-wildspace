// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta.js";
import type { WikiDocID, WikiDocAction, WikiDocEvent } from "../../../wiki.js";
*/

import { c } from "@lukekaalim/cast";
import { castWikiDocId, castWikiDocAction, castWikiDocEvent } from "../../../wiki.js";

/*::
export type WikiDocChannel = {
  Client:
    | {| type: 'wikidoc-subscribe', wikiDocIds: $ReadOnlyArray<WikiDocID> |}
    | {| type: 'wikidoc-action', wikiDocAction: WikiDocAction |}
  ,
  Server: { type: 'wikidoc-event', wikiDocId: WikiDocID, wikiDocEvent: WikiDocEvent }
}
*/

export const wikiDocChannel/*: AdvancedUpdateChannelDescription<WikiDocChannel>*/ = {
  eventPrefix: 'wikidoc',
  castClientEvent: c.or('type', {
    'wikidoc-subscribe': c.obj({ type: c.lit('wikidoc-subscribe'), wikiDocIds: c.arr(castWikiDocId) }),
    'wikidoc-action': c.obj({ type: c.lit('wikidoc-action'), wikiDocAction: castWikiDocAction }),
  }),
  castServerEvent: c.obj({ type: c.lit('wikidoc-event'), wikiDocId: castWikiDocId, wikiDocEvent: castWikiDocEvent })
}
