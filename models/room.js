// @flow strict

/*:: import type { Cast } from "@lukekaalim/cast"; */
/*:: import type { GameID } from "./game.js"; */
/*:: import type { AudioPlaylistID, AudioTrackID, AudioPlaylistState } from "./audio.js"; */
/*:: import type { EncounterState, EncounterID } from "./encounter.js"; */

import { castString, createObjectCaster, c } from "@lukekaalim/cast";

import { castGameId } from "./game.js";
import { castAudioPlaylistState } from "./audio.js";
import { castEncounterState } from "./encounter.js";

/*::
export type RoomID = string;
export type Room = {
  id: RoomID,
  gameId: GameID,

  title: string,
};

export type RoomState = {
  roomId: RoomID,
};

export type RoomUpdate =
  | { type: 'encounter', encounter: ?EncounterState }
  | { type: 'audio', audio: ?AudioPlaylistState }
*/

export const castRoomId/*: Cast<RoomID>*/ = castString;
export const castRoom/*: Cast<Room>*/ = createObjectCaster({
  id: castRoomId,
  gameId: castGameId,

  title: castString,
});

export const castRoomState/*: Cast<RoomState>*/ = createObjectCaster({
  roomId: castRoomId,
})

export const castRoomUpdate/*: Cast<RoomUpdate> */ = c.or('type', {
  'encounter': c.obj({ type: (c.lit('encounter')/*: Cast<'encounter'>*/), encounter: c.maybe(castEncounterState) }),
  'audio': c.obj({ type: (c.lit('audio')/*: Cast<'audio'>*/), audio: c.maybe(castAudioPlaylistState) }),
});