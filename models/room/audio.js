// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AudioPlaylist, AudioTrack, AudioPlaylistID } from '../audio.js'; */
/*::
import type { RoomStateAction } from "./actions";
*/

import { c } from "@lukekaalim/cast";
import { castAudioPlaylistId } from "../audio.js";

/*::
export type PlaylistPlaybackState = {
  id: AudioPlaylistID,

  mode:
    | { type: 'paused', progress: number }
    // the Unix Time when the first track would have started
    | { type: 'playing', startTime: number }
};


export type RoomAudioState = {
  volume: number,
  playback:
    | {| type: 'playlist', playlist: PlaylistPlaybackState |}
    | {| type: 'none' |},
};
*/

export const casPlaylistPlaybackState/*: Cast<PlaylistPlaybackState>*/ = c.obj({
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
    'playlist': c.obj({ type: c.lit('playlist'), playlist: casPlaylistPlaybackState }),
  })
})

export const calculatePlaylistProgress = (
  state/*: PlaylistPlaybackState*/,
  now/*: number*/
)/*: number*/ => {
  switch (state.mode.type) {
    case 'paused':
      return state.mode.progress;
    case 'playing':
      return now - state.mode.startTime;
  }
}

/*::
export type PlaylistPlaybackTrack = {
  index: number,
  track: AudioTrack,
  trackProgress: number,
  offsets: number[]
};
*/

export const calculatePlaylistCurrentTrack = (
  state/*: PlaylistPlaybackState*/,
  playlistTracks/*: $ReadOnlyArray<AudioTrack>*/,
  now/*: number*/,
)/*: ?PlaylistPlaybackTrack*/ => {
  if (playlistTracks.length === 0)
    return null;

  const lengths = playlistTracks.map(t => t.trackLengthMs);
  const offsets = lengths.reduce((acc, curr, i) => [...acc, acc[i] + curr], [0]);
  const totalLength = offsets[offsets.length - 1];
  const progress = calculatePlaylistProgress(state, now);

  const loopedProgress = (progress % totalLength) || 0;

  console.log(progress, offsets)

  const nextTrackIndex = offsets.findIndex(offset => loopedProgress < offset);
  const index = nextTrackIndex - 1;

  const track = playlistTracks[index];
  const trackProgress = loopedProgress - offsets[index]

  return { index, track, trackProgress, offsets };
};

const reduceRoomPlaylistPlaybackState = (state, action)/*: PlaylistPlaybackState*/ => {
  switch (action.type) {
    default:
      return state;
  }
};

const reduceRoomPlaybackState = (state, action) => {
  switch (action.type) {
    case 'load-scene':
      const { time } = action;
      const { playlist } = action.scene;
      if (!playlist)
        return { type: 'none' };
      if (state.type === 'playlist' && state.playlist.id === playlist)
        return state;

      return {
        type: 'playlist',
        playlist: { id: playlist, mode: { type: 'playing', startTime: time } }
      };
    case 'change-playlist': {
      const { time, playlist } = action;
      return {
        type: 'playlist',
        playlist: { id: playlist, mode: { type: 'playing', startTime: time } }
      };
    }
  }
  switch (state.type) {
    case 'none':
      return state;
    case 'playlist':
      return {
        type: 'playlist',
        playlist: reduceRoomPlaylistPlaybackState(state.playlist, action)
      };
    default:
      return state;
  }
};

export const reduceRoomAudioState = (state/*: RoomAudioState*/, action/*: RoomStateAction*/)/*: RoomAudioState*/ => {
  const playback = reduceRoomPlaybackState(state.playback, action);
  
  return {
    ...state,
    playback
  };
}