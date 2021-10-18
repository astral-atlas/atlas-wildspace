// @flow strict
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID } from "../game.js"; */
/*:: import type { Room, RoomID, RoomState } from "../room.js"; */

import { c } from "@lukekaalim/cast";
import { castGameId } from "../game.js";
import { castRoom, castRoomId, castRoomState } from "../room.js";

/*::
export type SelfAPI = {|
  ['/self']: {|
    GET: {
      query: empty,
      request: empty,
      response: { type: 'found', name: string }
    }
  |}
|};
*/

export const selfResourceDescription/*: ResourceDescription<SelfAPI['/self']> */ = {
  path: '/self',

  GET: {
    toResponseBody: c.obj({ type: c.lit('found'), name: c.str })
  },
};
export const selfAPI = {
  '/self': selfResourceDescription,
};
