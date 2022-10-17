// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type {
  AudioPlaylist, AudioTrack,
  PlaylistPlaybackState, PlaylistPlaybackTrack
} from '@astral-atlas/wildspace-models'; */
/*::
import type { AssetDownloadURLMap } from "../asset/map";
*/

import { useAudioPlayback } from "../game/audio";


/*::
export type PlaylistPlayerProps = {
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks: $ReadOnlyArray<AudioTrack>,
  assets: AssetDownloadURLMap,
  state: PlaylistPlaybackState,
  volume?: number,
}
*/
import { calculatePlaylistCurrentTrack } from "@astral-atlas/wildspace-models";

import { h, useEffect, useRef, useState } from "@lukekaalim/act";

export const PlaylistPlayer/*: Component<PlaylistPlayerProps>*/ = ({
  playlists,
  tracks,
  assets,
  state,
  volume = 1,
}) => {
  const ref = useRef();
  const playlist = playlists.find(p => p.id === state.id);
  if (!playlist)
    return null;
  
  const playlistTracks = playlist.trackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean);
  const current = usePlaylistPlaybackTrack(playlistTracks, state, [playlist, assets, volume === 0]);
  const asset = current && assets.get(current.track.trackAudioAssetId)
  
  useAudioPlayback(ref, current, state, [playlist, asset, volume === 0])

  if (!asset)
    return null;

  return h('audio', { ref, src: asset.downloadURL, volume });
}

const createPlaylistPlaybackController = (playbackState/*: PlaylistPlaybackState*/) => {

  const trackChangeSubscribers = new Set();
  const subscribeTrackChange = (subscriber) => {
    trackChangeSubscribers.add(subscriber);
    return () => {
      trackChangeSubscribers.delete(subscriber);
    }
  };
  const play = () => {

  };
  const stop = () => {

  };

};


export const usePlaylistPlaybackTrack = (
  tracks/*: AudioTrack[]*/,
  state/*: PlaylistPlaybackState*/,
  deps/*: mixed[]*/ = []
)/*: ?PlaylistPlaybackTrack*/ => {

  const [currentTrack, setCurrentTrack] = useState/*:: <?PlaylistPlaybackTrack>*/(() =>
    calculatePlaylistCurrentTrack(state, tracks, Date.now()));
  
  useEffect(() => {
    let id = null;
    const update = () => {
      const nextTrack = calculatePlaylistCurrentTrack(state, tracks, Date.now());
      setCurrentTrack(nextTrack);
      if (!nextTrack)
        return;
      const remainingTrackTime = nextTrack.track.trackLengthMs - (nextTrack.trackProgress % nextTrack.track.trackLengthMs);
      id = setTimeout(update, remainingTrackTime);
    };
    update();

    return () => {
      if (id)
        clearTimeout(id);
    }
  }, [state, ...deps])

  return currentTrack;
}
