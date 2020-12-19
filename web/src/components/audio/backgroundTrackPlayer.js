// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { ActiveTrackUpdateEvent, BackgroundAudioTrack } from '@astral-atlas/wildspace-models'; */
/*:: import type { StyleSheet } from '../../lib/style'; */
import { useWildspaceClient, useActiveGame } from "../../hooks/useWildspace";
import { useAsync, useConnection } from '../../hooks/useAsync';
import { Fragment, h } from "preact";
import { cssClass, cssStylesheet } from "../../lib/style";
import { useEffect, useRef, useState } from "preact/hooks";
import { animated, useTransition } from 'react-spring'

export const backgroundTrackPlayerStyles/*: StyleSheet*/ = cssStylesheet([
]);

export const useActiveTrack = ()/*: [?ActiveTrackUpdateEvent, ?BackgroundAudioTrack]*/ => {
  const client = useWildspaceClient();
  const activeGame = useActiveGame();
  const [connection] = useAsync(
    async () => activeGame && await client.audio.connectActiveTrack(activeGame.gameId)
  , [client, activeGame]);
  const [activeTrack] = useConnection(
    connection, (s, e) => e, null, [client]
  );
  const [trackInfo] = useAsync(
    async () => activeGame && client.audio.getAudioInfo(activeGame.gameId),
    [activeGame, client]
  );
  if (!activeTrack || !trackInfo)
    return [null, null];
  const activeBackgroundTrack = trackInfo.tracks.find(track => track.id === activeTrack.trackId);
  return [activeTrack, activeBackgroundTrack];
}

const TrackProgressBar = ({ activeTrack, audioRef }) => {
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement)
      return;
    if (!isNaN(audioElement.duration)) {
      setDuration(audioElement.duration);
    }
    const onLoad = () => {
      setDuration(audioElement.duration);
    };
    audioElement.addEventListener('loadedmetadata', onLoad);
    return () => {
      audioElement.removeEventListener('loadedmetadata', onLoad);
    };
  }, [activeTrack]);
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement)
      return;
    const intervalId = setInterval(() => {
      setProgress(audioElement.currentTime)
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, [activeTrack])

  return h('progress', { max: duration, value: progress });
};

const getActiveTrackCurrentTime = ({ duration }, { fromUnixTime, distanceSeconds }) => {
  // this how many seconds ago the track started
  const trackStartTime = (Date.now() - fromUnixTime) / 1000;
  return (trackStartTime + distanceSeconds) % duration;
};

const useMetadata = (func, deps) => {
  const audioRef = useRef();
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement)
      return;
    if (audioElement.readyState > 0) {
      func();
      return;
    }
    audioElement.addEventListener('loadedmetadata', func);
    return () => {
      audioElement.removeEventListener('loadedmetadata', func);
    };
  }, deps);
  return audioRef;
};

export const ActiveTrackPlayer = ()/*: Node*/ => {
  const [volume, setVolume] = useState(0);
  const [activeTrack, activeBackgroundTrack] = useActiveTrack();
  
  const audioRef = useMetadata(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !activeTrack)
      return;
    console.log(audioElement.duration, activeTrack, getActiveTrackCurrentTime(audioElement, activeTrack));
    audioElement.currentTime = getActiveTrackCurrentTime(audioElement, activeTrack);
    audioElement.play();
  }, [activeTrack, activeBackgroundTrack])

  if (!activeTrack || !activeBackgroundTrack)
    return null;

  return [
    h('audio', { ref: audioRef, src: activeBackgroundTrack.asset.url, loop: true, volume }),
    h('button', { style: { width: '100px' }, onClick: () => setVolume(volume === 0 ? 0.5 : 0) }, volume === 0 ? 'unmute' : 'mute'),
    h('input', { type: 'range', min: 0, step: 0.001, max: 1, value: volume, onInput: e => setVolume(e.currentTarget.value) })
  ];
};
