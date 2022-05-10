// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { Cast } from "@lukekaalim/cast";
*/


import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";

/*::
export type GameConnectionID = string;
export type GameConnectionState = {
  id: GameConnectionID,
  userId: UserID,
  heartbeat: number,
};
*/

export const castGameConnectionId = c.str;
export const castGameConnectionState/*: Cast<GameConnectionState>*/ = c.obj({
  id: castGameConnectionId,
  userId: castUserId,
  heartbeat: c.num,
})