// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*::
import type { 
  AudioTrack, AudioPlaylist, AudioPlaylistState,
  GameID, AssetDescription, AudioPlaylistID, AssetID
} from '@astral-atlas/wildspace-models';
*/
import { h, useContext, useMemo, useEffect, useRef, useState } from '@lukekaalim/act';

/*::
export type TrackData = {
  track: AudioTrack,
  trackDownloadURL: ?URL
};
export type PlaybackData = {
  progress: number,
  trackIndex: number,
};
*/

export const calculateTrackDataSums = (trackData/*: TrackData[]*/)/*: number[]*/ => {
  return trackData
    .map(d => d.track.trackLengthMs)
    .reduce/*:: <number[]>*/((acc, curr, index) => [...acc, (acc[index - 1] || 0) + curr], []);
};

export const usePlaybackData = (
  audio/*: AudioPlaylistState*/,
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
  }, [tracksData, audio.playlistStartTime, audio.playState])

  return getPlaybackData
};


/*::
export type RoomAudioPlayerProps = {
  audio: AudioPlaylistState,
  tracksData: TrackData[],
  volume?: number,
  controls?: boolean,
  onTrackChange?: ?AudioTrack => void
};
*/

export const RoomAudioPlayer/*: Component<RoomAudioPlayerProps>*/ = ({
  tracksData,
  audio,
  controls = false,
  volume = 1,
  onTrackChange = _ => {},
}) => {
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
        if (trackData.trackDownloadURL && audioElement.src !== trackData.trackDownloadURL.href)
          audioElement.src = trackData.trackDownloadURL.href;

        if (Math.abs(audioElement.currentTime - (playback.progress / 1000)) > 1)
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
  }, [getPlaybackData, tracksData.map(t => t.track.id).join(' ')])

  useEffect(() => {
    const playback = getPlaybackData();
    const { current: audioElement } = audioRef;
    if (audioElement && playback && playback.trackIndex !== -1) {
      audioElement.play();
    }
  }, [getPlaybackData, volume])

  if (audio.playState !== 'playing')
    return null;

  return [
    h('audio', { ref: audioRef, controls, volume: volume })
  ];
};
