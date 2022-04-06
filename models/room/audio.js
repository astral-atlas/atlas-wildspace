// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AudioPlaylist, AudioTrack, AudioPlaylistID } from '../audio.js'; */

import { c } from "@lukekaalim/cast";
import { castAudioPlaylistId } from "../audio.js";

/*::
export type RoomPlaylistPlaybackState = {
  id: AudioPlaylistID,

  mode:
    | { type: 'paused', progress: number }
    // the Unix Time when the first track would have started
    | { type: 'playing', startTime: number }
};


export type RoomAudioState = {
  volume: number,
  playback:
    | { type: 'playlist', playlist: RoomPlaylistPlaybackState }
    | { type: 'none' },
};
*/

export const castRoomPlaylistPlaybackState/*: Cast<RoomPlaylistPlaybackState>*/ = c.obj({
  id: castAudioPlaylistId,
  mode: c.or('type', {
    'paused': c.obj({ type: c.lit('paused'), progress: c.num }),
    'playing': c.obj({ type: c.lit('playing'), startTime: c.num }),
  })
})

export const castRoomAudioState/*: Cast<RoomAudioState>*/ = c.obj({
  volume: c.num,
  playback: c.or('type', {
    'none': c.obj({ type: c.lit('none') }),
    'playlist': c.obj({ type: c.lit('playlist'), playlist: castRoomPlaylistPlaybackState }),
  })
})

export const calculatePlaylistProgress = (
  state/*: RoomPlaylistPlaybackState*/,
  now/*: number*/
)/*: number*/ => {
  switch (state.mode.type) {
    case 'paused':
      return state.mode.progress;
    case 'playing':
      return now - state.mode.startTime;
  }
}

export const calculatePlaylistCurrentTrack = (
  state/*: RoomPlaylistPlaybackState*/,
  playlistTracks/*: AudioTrack[]*/,
  now/*: number*/,
)/*: ?{ index: number, track: AudioTrack, trackProgress: number, offsets: number[] }*/ => {
  if (playlistTracks.length === 0)
    return null;

  const lengths = playlistTracks.map(t => t.trackLengthMs);
  const offsets = lengths.reduce((acc, curr, i) => [...acc, acc[i] + curr], [0]);
  const totalLength = offsets[offsets.length - 1];
  const progress = calculatePlaylistProgress(state, now);

  const loopedProgress = (progress % totalLength) || 0;

  const nextTrackIndex = offsets.findIndex(offset => loopedProgress < offset);
  const index = nextTrackIndex - 1;

  const track = playlistTracks[index];
  const trackProgress = loopedProgress - offsets[index]

  return { index, track, trackProgress, offsets };
};
