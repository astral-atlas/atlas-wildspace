// @flow strict
/*::
import type { WikiDoc, WikiDocID, WikiDocUpdate } from "./doc";
import type { WikiDocFocus, WikiDocFocusAction } from "./focus";
import type { GameConnectionID, GameConnectionState } from "..";
import type { WikiDocConnection } from "./connection";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castWikiDoc, castWikiDocUpdate, castWikiDocId } from "./doc.js";
import { castWikiDocFocus } from "./focus.js";
import { castWikiDocConnection } from "./connection.js";
import { castGameConnectionId } from "../../game.js";

/*::
export type WikiDocEvent =
  | {| type: 'focus', docId: WikiDocID, focus: WikiDocFocus |}
  | {| type: 'update', docId: WikiDocID, update: WikiDocUpdate |}
  | {| type: 'connect', docId: WikiDocID, connection: WikiDocConnection |}
  | {| type: 'disconnect', docId: WikiDocID, connectionId: GameConnectionID |}
  //| {| type: 'load', doc: WikiDoc, focus: $ReadOnlyArray<WikiDocFocus>, connections: $ReadOnlyArray<WikiDocConnection> |}
*/

export const castWikiDocEvent/*: Cast<WikiDocEvent>*/ = c.or('type', {
  'focus': c.obj({ type: c.lit('focus'), docId: castWikiDocId, focus: castWikiDocFocus }),
  'update': c.obj({ type: c.lit('update'), docId: castWikiDocId, update: castWikiDocUpdate }),
  'connect': c.obj({ type: c.lit('connect'), docId: castWikiDocId, connection: castWikiDocConnection }),
  'disconnect': c.obj({ type: c.lit('disconnect'), docId: castWikiDocId, connectionId: castGameConnectionId }),
  //'load': c.obj({ type: c.lit('load'), doc: castWikiDoc, focus: c.arr(castWikiDocFocus), connections: c.arr(castWikiDocConnection) }),
})