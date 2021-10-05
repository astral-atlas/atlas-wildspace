// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { AudioTrack, RoomAudioState, GameID, AssetDescription, AudioPlaylistID } from '@astral-atlas/wildspace-models'; */
import { h, useContext, useMemo, useEffect, useRef } from '@lukekaalim/act';

import { useAsync } from '../hooks/async.js'; 
import { clientContext } from '../hooks/context.js';

export const calculateTrackDataSums = (trackData/*: TrackData[]*/)/*: number[]*/ => {
  return trackData
    .map(d => d.track.trackLengthMs)
    .reduce/*:: <number[]>*/((acc, curr, index) => [...acc, (acc[index - 1] || 0) + curr], []);
};

/*::
export type TrackData = {
  track: AudioTrack,
  asset: AssetDescription,
  trackDownloadURL: URL
};
export type PlaybackData = {
  progress: number,
  trackIndex: number,
};
*/

export const usePlaylistTrackData = (
  gameId/*: ?GameID*/ = null,
  playlistId/*: ?AudioPlaylistID*/ = null,
)/*: TrackData[]*/ => {
  const client = useContext(clientContext);

  const [playlist] = useAsync(async () => gameId && playlistId && client.audio.playlist.read(gameId, playlistId), [client, gameId, playlistId]);
  const [tracksData] = useAsync(async () => gameId && playlist && await Promise.all(playlist.trackIds.map(id => client.audio.tracks.read(gameId, id))), [playlist, gameId]);

  return tracksData || [];
}

export const usePlaybackData = (
  audio/*: RoomAudioState*/,
  tracksData/*: TrackData[]*/ = [],
)/*: () => ?PlaybackData*/ => {
  const getPlaybackData = useMemo(() => {
    const trackLengthSums = calculateTrackDataSums(tracksData);

    // the Index of the active track
    const getTrackIndex = () => {
      const totalPlaytime = Date.now() - audio.playlistStartTime;
      return trackLengthSums.findIndex(timeTrackWouldEnd => totalPlaytime <= timeTrackWouldEnd);
    }
    // How far along the current track is in it's personal playback
    const getTrackProgress = () => {
      const trackIndex = getTrackIndex();
      const totalPlaytime = Date.now() - audio.playlistStartTime;
      const sumOfEveryPreviousTrack = trackLengthSums[trackIndex - 1] || 0;
      const currentTrackPlaythrough = totalPlaytime - sumOfEveryPreviousTrack;
      return currentTrackPlaythrough;
    };
  
    // A collection of useful data
    return () => {
      const trackIndex = getTrackIndex();
      const progress = getTrackProgress();
  
      return { progress, trackIndex };
    };
  }, [tracksData, audio.playlistStartTime])

  return getPlaybackData
};

/*::
export type RoomAudioPlayerProps = {
  audio: RoomAudioState,
  tracksData: TrackData[],
  controls?: boolean,
  onTrackChange?: ?AudioTrack => void
};
*/

export const RoomAudioPlayer/*: Component<RoomAudioPlayerProps>*/ = ({ tracksData, audio, controls = false, onTrackChange = _ => {} }) => {
  //const tracksData = useCurrentRoomTrackData(gameId, audio);
  const getPlaybackData = usePlaybackData(audio, tracksData);
  const audioRef = useRef/*:: <?HTMLAudioElement>*/();

  useEffect(() => {
    let timeoutId = null;
    const update = () => {
      const playback = getPlaybackData();
      const { current: audioElement } = audioRef;
      if (!playback || !audioElement) {
        onTrackChange(null);
        return;
      }
      const trackData = tracksData[playback.trackIndex];
      if (!trackData) {
        audioElement.pause();
        onTrackChange(null);
      } else {
        audioElement.src = trackData.trackDownloadURL.href;
        audioElement.currentTime = playback.progress / 1000;
        audioElement.play();
        onTrackChange(trackData.track);
        timeoutId = setTimeout(update, trackData.track.trackLengthMs - playback.progress);
      }
    };
    update();
    return () => {
      if (timeoutId)
        clearTimeout(timeoutId);
    };
  }, [getPlaybackData, tracksData])

  return [
    h('audio', { ref: audioRef, controls })
  ];
};
