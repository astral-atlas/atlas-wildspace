// @flow strict
/*::
import type { GameID } from "../../game/game";
import type { GamePage } from "../../game/page";
import type { ResourceDescription } from "@lukekaalim/net-description";
*/
/*::

type GamePageResource = {|
  GET: {
    query: { gameId: GameID },
    response: { type: 'found', gamePage: GamePage },
    request: empty,
  }
|}

export type GamePageAPI = {|
  '/games/page': GamePageResource,
|};
*/

import { c } from "@lukekaalim/cast";
import { castGameId, castGamePage } from "../../game.js";

const gamePage/*: ResourceDescription<GamePageResource>*/ = {
  path: '/games/page',
  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), gamePage: castGamePage })
  }
}

export const gamePageAPI = {
  '/games/page': gamePage,
}