// @flow strict

/*:: import type { Cast } from "@lukekaalim/cast"; */
/*:: import type { GameID } from "./game.js"; */
/*:: import type { AudioPlaylistID, AudioTrackID } from "./audio.js"; */

import { castString, createObjectCaster, castNumber, createConstantUnionCaster, createNullableCaster } from "@lukekaalim/cast";

import { castAudioPlaylistId, castAudioTrackId } from './audio.js'; 
import { castGameId } from "./game.js";

/*::
export type RoomID = string;
export type Room = {
  id: RoomID,
  gameId: GameID,

  title: string,
};

export type RoomAudioState = {
  playlistId: AudioPlaylistID,
  trackIndex: number,
  // the Unix Time when the first track would have started
  playlistStartTime: number,
  playState: 'paused' | 'stopped' | 'playing',
  globalVolume: number,
};

export type RoomState = {
  audio: ?RoomAudioState
};
*/

export const castRoomId/*: Cast<RoomID>*/ = castString;
export const castRoom/*: Cast<Room>*/ = createObjectCaster({
  id: castRoomId,
  gameId: castGameId,

  title: castString,
});

export const castRoomAudioState/*: Cast<RoomAudioState>*/ = createObjectCaster({
  playlistId: castAudioPlaylistId,
  trackIndex: castNumber,
  playlistStartTime: castNumber,
  playState: createConstantUnionCaster(['paused', 'stopped', 'playing']),
  globalVolume: castNumber,
});

export const castRoomState/*: Cast<RoomState>*/ = createObjectCaster({
  audio: createNullableCaster(castRoomAudioState),
})