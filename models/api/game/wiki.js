// @flow strict
/*::
import type { ResourceDescription } from "@lukekaalim/net-description/resource";
import type { AdvancedGameCRUDAPI } from "./meta";

import type { WikiDoc, WikiDocID } from "../../wiki.js";
import type { GameID } from "../../game.js";
*/
import { c } from "@lukekaalim/cast";

import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castWikiDoc } from "../../wiki.js";
import { castGameId } from "../../game.js";
import { castWikiDocId } from "../../wiki/doc.js";

/*::
export type WikiResource = AdvancedGameCRUDAPI<{
  resource: WikiDoc,
  resourceName: 'wikiDoc',

  resourceId: WikiDocID,
  resourceIdName: 'wikiDocId',

  resourcePostInput: { title: string },
  resourcePutInput: { title: string },
}>
*/

const wikiResource/*: ResourceDescription<WikiResource>*/ = createAdvancedCRUDGameAPI({
  path: '/game/wiki',
  castResource: castWikiDoc,
  resourceName: 'wikiDoc',
  resourceIdName: 'wikiDocId',

  castPostResource: c.obj({ title: c.str }),
  castPutResource: c.obj({ title: c.str }),
});
/*::
export type WikiIDResource = {|
  GET: {|
    query: {| gameId: GameID, wikiDocId: WikiDocID |},
    request: empty,
    response: {| type: 'found', wikiDoc: WikiDoc |},
  |}
|};
*/
const wikiIdResource/*: ResourceDescription<WikiIDResource>*/ = {
  path: '/game/wiki/id',
  GET: {
    castQuery: c.obj({ gameId: castGameId, wikiDocId: castWikiDocId }),
    castResponse: c.obj({ type: c.lit('found'), wikiDoc: castWikiDoc }),
  }
};

/*::
export type WikiAPI = {
  '/game/wiki': WikiResource,
  '/game/wiki/id': WikiIDResource,
};
*/

export const wikiAPI = {
  '/game/wiki': wikiResource,
  '/game/wiki/id': wikiIdResource,
}
