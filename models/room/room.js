// @flow strict

/*:: import type { Cast } from "@lukekaalim/cast"; */
/*:: import type { GameID } from "../game.js"; */
/*:: import type { AudioPlaylistID, AudioTrackID } from "../audio.js"; */
/*:: import type { EncounterState, EncounterID } from "../encounter.js"; */
/*:: import type { RoomAudioState } from "./audio"; */
/*:: import type { RoomSceneState } from "./scene"; */

import { castString, createObjectCaster, c } from "@lukekaalim/cast";

import { castGameId } from "../game.js";


/*::
export type RoomID = string;
export type Room = {
  id: RoomID,
  gameId: GameID,

  title: string,
  hidden: ?boolean,
};
*/

export const castRoomId/*: Cast<RoomID>*/ = castString;
export const castRoom/*: Cast<Room>*/ = createObjectCaster({
  id: castRoomId,
  gameId: castGameId,
  hidden: c.maybe(c.bool),

  title: castString,
});
