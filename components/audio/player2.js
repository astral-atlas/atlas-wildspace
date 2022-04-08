// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type {
  AudioPlaylist, AudioTrack,
  PlaylistPlaybackState, PlaylistPlaybackTrack
} from '@astral-atlas/wildspace-models'; */
/*:: import type { LocalAsset } from "./track"; */
/*::
export type PlaylistPlayerProps = {
  playlists: AudioPlaylist[],
  tracks: AudioTrack[],
  assets: LocalAsset[],
  state: PlaylistPlaybackState,
}
*/
import { calculatePlaylistCurrentTrack } from "@astral-atlas/wildspace-models";

import { useEffect, useState } from "@lukekaalim/act";

export const PlaylistPlayer/*: Component<PlaylistPlayerProps>*/ = ({
  playlists,
  tracks,
  assets,
  state
}) => {
  const current = usePlaylistPlaybackTrack(tracks, state);
  const asset = current && assets.find(a => a.id === current.track.id)
  return []
}

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
      const remainingTrackTime = nextTrack.track.trackLengthMs - nextTrack.trackProgress;
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
