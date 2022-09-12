// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { Cast } from "@lukekaalim/cast";
import type { GameID } from "./game";
*/


import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castGameId } from "./game.js";

/*::
export type GameConnectionID = string;
export type GameConnectionState = {
  id: GameConnectionID,
  gameId: GameID,
  userId: UserID,
  heartbeat: number,
};
*/

export const castGameConnectionId = c.str;
export const castGameConnectionState/*: Cast<GameConnectionState>*/ = c.obj({
  id: castGameConnectionId,
  userId: castUserId,
  gameId: castGameId,
  heartbeat: c.num,
})