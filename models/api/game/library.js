// @flow strict
/*::
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { GameID } from "../../game/game";
import type { LibraryData } from "../../game/library";
*/
import { c } from "@lukekaalim/cast";
import { castGameId } from "../../game/game.js";
import { castLibraryData } from "../../game/library.js";

/*::

type LibraryResource = {|
  GET: {
    query: { gameId: GameID },
    response: { library: LibraryData },
    request: empty,
  }
|}

export type LibraryAPI = {|
  '/games/library': LibraryResource
|}
*/

const library/*: ResourceDescription<LibraryResource>*/ = {
  path: '/games/library',
  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ library: castLibraryData })
  }
}

export const libraryAPI = {
  '/games/library': library
}