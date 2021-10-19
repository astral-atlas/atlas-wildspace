// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { AudioTrack, AudioPlaylist, AudioPlaylistState, GameID, AssetDescription, AudioPlaylistID, AssetID } from '@astral-atlas/wildspace-models'; */
import { h, useContext, useMemo, useEffect, useRef, useState } from '@lukekaalim/act';
import { useAPI } from '../hooks/api.js';

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
  const client = useAPI();

  const [playlist] = useAsync(async () => gameId && playlistId && client.audio.playlist.read(gameId, playlistId), [client, gameId, playlistId]);
  const [tracksData] = useAsync(async () => gameId && playlist && await Promise.all(playlist.trackIds.map(id => client.audio.tracks.read(gameId, id))), [playlist, gameId]);

  return tracksData || [];
}

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
  }, [tracksData, audio.playlistStartTime])

  return getPlaybackData
};

export const AssetPlayer/*: Component<{
  assetId: AssetID,
  currentTime: number,
  isPaused?: boolean,
  controls?: boolean,
  volume?: number,
}>*/ = ({ assetId, currentTime, isPaused = false, controls = false, volume = 1 }) => {
  const api = useAPI();
  const [asset] = useAsync(() => api.asset.peek(assetId), [assetId]);
  const audioRef = useRef/*::<?HTMLAudioElement>*/(null);

  if (!asset)
    return null;
  const timeLastUpdated = useMemo(() => Date.now(), [currentTime]);
  useEffect(() => {
    const { current: audioElement } = audioRef;
    if (!audioElement)
      return;

    if (audioElement.src !== asset.downloadURL.href);
      audioElement.src = asset.downloadURL.href;
    if (audioElement.paused && !isPaused && volume !== 0) {
      audioElement.play();
    } else if((!audioElement.paused && isPaused) || (volume === 0))
      audioElement.pause();

    const targetTime = currentTime + ((Date.now() - timeLastUpdated) / 1000);
    if (Math.abs(audioElement.currentTime - targetTime) > 2) {
      audioElement.currentTime = targetTime;
    }
  }, [isPaused, asset.downloadURL.href, volume === 0, currentTime])
  
  const refresh = () => {
    const { current: audioElement } = audioRef;
    if (!audioElement)
      return;

    const targetTime = currentTime + ((Date.now() - timeLastUpdated) / 1000);
    if (Math.abs(audioElement.currentTime - targetTime) > 2) {
      audioElement.currentTime = targetTime;
    if (audioElement.paused && !isPaused && volume !== 0) {
      audioElement.play();
    } else if((!audioElement.paused && isPaused) || (volume === 0))
      audioElement.pause();
    }
  }

  return [
    h('audio', { ref: audioRef, controls, volume, onProgress: refresh, onLoadStart: refresh })
  ]
};

export const calculateTrackIntervals = (tracks/*: AudioTrack[]*/)/*: number[]*/ => {
  const trackLengths = tracks.map(t => t.trackLengthMs);
  const trackIntervals = trackLengths.reduce((intervals, length, index) => [...intervals, (intervals[index - 1] || 0) + length], []);
  return trackIntervals;
}

export const usePlaybackData2 = (tracks/*: AudioTrack[]*/, state/*: AudioPlaylistState*/)/*: { trackIndex: number, currentTime: number }*/ => {
  const trackIntervals = calculateTrackIntervals(tracks);
  const [playback, setPlayback] = useState({ currentTime: 0, trackIndex: -1 });

  useEffect(() => {
    const calculatePlayback = () => {
      const totalPlaytime = Date.now() - state.playlistStartTime;
      const trackIndex = trackIntervals.findIndex(interval => interval >= totalPlaytime) || 0;
      const currentTime = totalPlaytime - (trackIntervals[trackIndex - 1] || 0);
      return { currentTime, trackIndex };
    };
    setPlayback(calculatePlayback());
    const now = Date.now();
    const trackTimeouts = trackIntervals
      .map(interval => interval + (state.playlistStartTime - now))
      .filter(trackEndTime => trackEndTime >= 0)
      .map(trackEndTime => setTimeout(() => setPlayback(calculatePlayback()), trackEndTime + 100))
    return () => {
      trackTimeouts.map(clearTimeout);
    };
  }, [state, tracks.map(t => t.id).join()])

  return playback;
};

export const PlaylistPlayer/*: Component<{ tracks: AudioTrack[], state: AudioPlaylistState, volume?: number }>*/ = ({ state, tracks, volume }) => {
  const { trackIndex, currentTime } = usePlaybackData2(tracks, state);

  return [tracks.map((track, index) => h(AssetPlayer, {
    key: `${track.id}${index}`,
    assetId: track.trackAudioAssetId,
    isPaused: trackIndex !== index,
    volume,
    currentTime: trackIndex !== index ? 0 : (currentTime / 1000),
  }))]};

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
  tracksData, audio, controls = false, onTrackChange = _ => {}, volume = 1
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
        if (audioElement.src !== trackData.trackDownloadURL.href)
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
  }, [getPlaybackData, tracksData.map(t => t.asset.id).join(' ')])

  useEffect(() => {
    const playback = getPlaybackData();
    const { current: audioElement } = audioRef;
    if (audioElement && playback && playback.trackIndex !== -1) {
      audioElement.play();
    }
  }, [getPlaybackData, volume])

  return [
    h('audio', { ref: audioRef, controls, volume })
  ];
};
