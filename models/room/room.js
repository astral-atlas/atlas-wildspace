// @flow strict

/*:: import type { Cast } from "@lukekaalim/cast"; */
/*:: import type { GameID } from "../game.js"; */
/*:: import type { AudioPlaylistID, AudioTrackID } from "../audio.js"; */
/*:: import type { EncounterState, EncounterID } from "../encounter.js"; */
/*:: import type { RoomAudioState } from "./audio"; */
/*:: import type { RoomSceneState } from "./scene"; */
/*:: import type { RoomLobbyState } from "./lobby"; */

import { castString, createObjectCaster, c } from "@lukekaalim/cast";

import { castGameId } from "../game.js";
import { castEncounterState } from "../encounter.js";
import { castRoomAudioState } from "./audio.js";
import { castRoomLobbyState } from "./lobby.js";
import { castRoomSceneState } from "./scene.js";


/*::
export type RoomID = string;
export type Room = {
  id: RoomID,
  gameId: GameID,

  title: string,
  hidden: ?boolean,
};

export type RoomUpdate =
  | {| type: 'encounter', encounter: ?EncounterState |}
  | {| type: 'audio', audio: RoomAudioState |}
  | {| type: 'lobby', lobby: RoomLobbyState |}
*/

export const castRoomId/*: Cast<RoomID>*/ = castString;
export const castRoom/*: Cast<Room>*/ = createObjectCaster({
  id: castRoomId,
  gameId: castGameId,
  hidden: c.maybe(c.bool),

  title: castString,
});

export const castRoomUpdate/*: Cast<RoomUpdate> */ = c.or('type', {
  'encounter': c.obj({ type: (c.lit('encounter')/*: Cast<'encounter'>*/), encounter: c.maybe(castEncounterState) }),
  'audio': c.obj({ type: (c.lit('audio')/*: Cast<'audio'>*/), audio: castRoomAudioState }),
  'lobby': c.obj({ type: c.lit('lobby'), lobby: castRoomLobbyState })
});