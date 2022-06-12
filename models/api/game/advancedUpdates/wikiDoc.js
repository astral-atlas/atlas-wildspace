// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta.js";
import type { Cast } from "@lukekaalim/cast";
import type {
  GameConnectionID, WikiDocConnection, WikiDocFocus,
  WikiDocID, WikiDoc, WikiDocAction, WikiDocEvent,
  WikiDocState
} from "../../../game";
*/

import { c } from "@lukekaalim/cast";
import {
  castWikiDocId,
  castWikiDocAction,
  castWikiDocEvent,
  reduceWikiDocStateEvent
} from "../../../game/wiki.js";

/*::
export type WikiDocChannel = {
  Resource: WikiDocState,
  Client:
    | {| type: 'wikidoc-subscribe', wikiDocId: WikiDocID |}
    | {| type: 'wikidoc-unsubscribe', wikiDocId: WikiDocID |}
    | {| type: 'wikidoc-action', wikiDocId: WikiDocID, wikiDocAction: WikiDocAction |}
  ,
  Server: {| type: 'wikidoc-event', wikiDocId: WikiDocID, wikiDocEvent: WikiDocEvent |}
}
*/

export const wikiDocChannel/*: AdvancedUpdateChannelDescription<WikiDocChannel>*/ = {
  eventPrefix: 'wikidoc',
  castClientEvent: c.or('type', {
    'wikidoc-subscribe':    c.obj({ type: (c.lit('wikidoc-subscribe')/*: Cast<'wikidoc-subscribe'>*/), wikiDocId: castWikiDocId }),
    'wikidoc-unsubscribe':  c.obj({ type: (c.lit('wikidoc-unsubscribe')/*: Cast<'wikidoc-unsubscribe'>*/), wikiDocId: castWikiDocId }),
    'wikidoc-action':       c.obj({ type: (c.lit('wikidoc-action')/*: Cast<'wikidoc-action'>*/), wikiDocId: castWikiDocId, wikiDocAction: castWikiDocAction }),
  }),
  castServerEvent: c.obj({ type: c.lit('wikidoc-event'), wikiDocId: castWikiDocId, wikiDocEvent: castWikiDocEvent }),
  reduceResource(state, { wikiDocEvent }) {
    return reduceWikiDocStateEvent(state, wikiDocEvent);
  }
}
