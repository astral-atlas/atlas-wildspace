// @flow strict
/*:: import type { Cast } from "@lukekaalim/cast"; */
/*:: import type { GameID } from './game.js'; */
/*:: import type { AssetID } from "./asset.js"; */

import { castString, createObjectCaster, createArrayCaster, castNumber, createConstantUnionCaster, createNullableCaster, c } from "@lukekaalim/cast";
import { castGameId } from "./game.js";
import { castAssetID } from "./asset.js";

/*::
export type AudioTrackID = string;
export type AudioTrack = {
  id: AudioTrackID,
  title: string,
  artist: ?string,

  trackLengthMs: number,

  gameId: GameID,
  trackAudioAssetId: AssetID,
  coverImageAssetId: ?AssetID
};

export type AudioPlaylistID = string;
export type AudioPlaylist = {
  id: AudioPlaylistID,

  title: string,
  gameId: GameID,
  trackIds: $ReadOnlyArray<AudioTrackID>,
};
*/

export const castAudioTrackId/*: Cast<AudioTrackID>*/ = castString;
export const castAudioTrack/*: Cast<AudioTrack>*/ = createObjectCaster({
  id: castAudioTrackId,
  title: castString,
  artist: createNullableCaster(castString),

  trackLengthMs: castNumber,

  gameId: castGameId,
  trackAudioAssetId: castAssetID,
  coverImageAssetId: createNullableCaster(castAssetID),
});

export const castAudioPlaylistId/*: Cast<AudioPlaylistID>*/ = castString;
export const castAudioPlaylist/*: Cast<AudioPlaylist>*/ = createObjectCaster({
  id: castAudioTrackId,
  title: castString,
  
  gameId: castGameId,
  trackIds: createArrayCaster(castAudioTrackId),
});

/*:: 
export type AudioPlaylistState = {
  playlistId: AudioPlaylistID,
  trackIndex: number,
  // the Unix Time when the first track would have started
  playlistStartTime: number,
  playState: 'paused' | 'stopped' | 'playing',
  globalVolume: number,
};
*/

export const castAudioPlaylistState/*: Cast<AudioPlaylistState>*/ = createObjectCaster({
  playlistId: castAudioPlaylistId,
  trackIndex: castNumber,
  playlistStartTime: castNumber,
  playState: createConstantUnionCaster(['paused', 'stopped', 'playing']),
  globalVolume: castNumber,
});

/*::
export type AudioTrackGroupID = string;
export type AudioTrackGroup = {
  id: AudioTrackGroupID,

  name: string,
  tracks: $ReadOnlyArray<AudioTrackID>,
};
*/
export const castAudioTrackGroupId/*: Cast<AudioTrackGroupID>*/ = c.str;
export const castAudioTrackGroup/*: Cast<AudioTrackGroup>*/ = c.obj({
  id: castAudioTrackGroupId,
  name: c.str,
  tracks: c.arr(castAudioTrackId),
});