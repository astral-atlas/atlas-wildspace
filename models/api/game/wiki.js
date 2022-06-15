// @flow strict
/*::
import type { ResourceDescription } from "@lukekaalim/net-description/resource";
import type { AdvancedGameCRUDAPI } from "./meta";

import type { WikiDoc, WikiDocID, WikiDocState } from "../../game.js";
import type { GameID } from "../../game.js";
*/
import { c } from "@lukekaalim/cast";

import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castWikiDoc } from "../../game.js";
import { castGameId } from "../../game.js";
import { castWikiDocId } from "../../game.js";
import { castWikiDocState } from "../../game/wiki/state.js";

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
export type WikiStateByIDResource = {|
  GET: {
    query: {| gameId: GameID, wikiDocId: WikiDocID |},
    request: empty,
    response: {| type: 'found', wikiDocState: WikiDocState |},
  }
|};
*/
const wikiStateByIdResource/*: ResourceDescription<WikiStateByIDResource>*/ = {
  path: '/game/wiki/state/id',
  GET: {
    castQuery: c.obj({ gameId: castGameId, wikiDocId: castWikiDocId }),
    castResponse: c.obj({ type: c.lit('found'), wikiDocState: castWikiDocState }),
  }
};

/*::
export type WikiAPI = {
  '/game/wiki': WikiResource,
  '/game/wiki/state/id': WikiStateByIDResource,
};
*/

export const wikiAPI = {
  '/game/wiki': wikiResource,
  '/game/wiki/state/id': wikiStateByIdResource,
}
