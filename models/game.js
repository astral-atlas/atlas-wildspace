// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from "@lukekaalim/cast/main"; */

import { castString, createObjectCaster, createArrayCaster } from "@lukekaalim/cast"; 
import { castUserId } from '@astral-atlas/sesame-models';

/*::
export type GameID = string;
export type Game = {
  id: GameID,
  name: string,
  gameMasterId: UserID,
  playerIds: $ReadOnlyArray<UserID>
};
*/

export const castGameId/*: Cast<GameID>*/ = castString;
export const castGame/*: Cast<Game>*/ = createObjectCaster({
  id: castGameId,
  name: castString,
  gameMasterId: castUserId,
  playerIds: createArrayCaster(castUserId),
});
