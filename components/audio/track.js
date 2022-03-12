// @flow strict
/*::
import type { AudioTrack, AudioPlaylistState, AssetID } from "@astral-atlas/wildspace-models";
import type { Component } from '@lukekaalim/act';

import type { PlaybackData } from "./player";
*/
import { h, useEffect, useRef } from '@lukekaalim/act';
import { v4 as uuid } from 'uuid';
import styles from './index.module.css';

/*::
export type TrackInfoProps = {
  track: AudioTrack,
  coverImage?: ?URL
};
*/

export const TrackInfo/*: Component<TrackInfoProps>*/ = ({ children, track, coverImage }) => {
  return h('div', { class: styles.trackInfo }, [
    !!coverImage && h('img', { src: coverImage }),
    h('p', { class: styles.trackInfoTitle }, track.title),
    !!track.artist && h('p', {}, `${track.artist}`),
    h('p', {}, `${track.trackLengthMs/1000}s`),
    children,
  ]);
};

/*::
export type PlaylistTrackControlProps = {
  track: AudioTrack,
  getPlaybackData: () => ?PlaybackData,
  trackIndex: number,
  onProgressChange: (offset: number) => mixed,
};
*/

export const PlaylistTrackControl/*: Component<PlaylistTrackControlProps>*/ = ({
  track,
  getPlaybackData,
  trackIndex,
  onProgressChange
}) => {
  const inputRef = useRef();
  useEffect(() => {
    const { current: input } = inputRef;
    if (!input) return;
  
    const id = setInterval(() => {
      const playback = getPlaybackData();

      const isPlaying = playback && playback.trackIndex === trackIndex;
      
      input.disabled = !playback;
      if (!playback)
        return;

      const progress = playback && playback.progress / track.trackLengthMs;
      
      if (isPlaying) {
        input.value = progress;
      } else {
        input.value = playback.trackIndex < trackIndex ? 0 : 1
      }
    }, 100);

    return () => clearInterval(id);
  }, [track, getPlaybackData])

  const onInput = (e) => {
    const trackProgress = e.target.valueAsNumber * track.trackLengthMs;
    onProgressChange(trackProgress)
  }

  return [
    h('div', { style: { display: 'flex', flexDirection: 'row' } }, [
      h('input', {
        ref: inputRef,
        style: { display: 'inline-block' },
        type: 'range',
        step: 1 / track.trackLengthMs,
        onInput,
        min: 0, max: 1
      }),
      h('span', {}, trackIndex),
      h('span', {}, track.title),
    ])
  ];
}

/*::
export type TrackUploadInfoProps = {
  file: File,
  title?: string,
  artist?: string,
  imageURL?: ?URL,
  trackURL?: ?URL,
  onInfoChange?: () => mixed
}
*/

export const TrackUploadInfo/*: Component<TrackUploadInfoProps>*/ = ({ file, onInfoChange, trackURL, imageURL, title, artist }) => {
  const audioRef = useRef();
  const onClick = (e) => {
    if (e.target === audioRef.current)
      return;
    
    const { current: audio } = audioRef;
    if (!audio) return;
    audio.paused ? audio.play() : audio.pause();
  };
  return h('div', { class: styles.trackUploadInfo, onClick }, [
    !!title && h('p', {}, title),
    !!artist && h('p', {}, artist),
    !!imageURL && h('img', { src: imageURL }),
    !!trackURL && h('audio', { ref: audioRef, src: trackURL, controls: true })
  ]);
};

/*::
export type StagingTrack = {
  audioFile: File,
  imageFile: ?Blob,

  title: string,
  album: string,
  artist: string,

  trackLengthMs: number,
};

export type StagingTrackInputProps = {
  track: StagingTrack,
  onTrackChange: StagingTrack => mixed,
};
*/
export const StagingTrackInput/*: Component<StagingTrackInputProps>*/ = ({ track, onTrackChange }) => {
  const onTitleInput = (e) => {
    onTrackChange({ ...track, title: e.target.value });
  }
  return [
    h('form', {}, [
      h('input', { type: 'text', value: track.title, onInput: onTitleInput })
    ])
  ]
}
/*::
export type LocalAsset = {
  id: AssetID,
  url: URL
};
*/
export const applyLocalStagingTrack = (
  { imageFile, audioFile, title, artist, trackLengthMs }/*: StagingTrack*/
)/*: { track: AudioTrack, imageAsset: ?LocalAsset, audioAsset: LocalAsset }*/ => {
  const imageAsset = imageFile && {
    id: uuid(),
    url: new URL(URL.createObjectURL(imageFile))
  };
  const audioAsset = {
    id: uuid(),
    url: new URL(URL.createObjectURL(audioFile))
  };
  const track = {
    id: uuid(),
    trackLengthMs,
    title,
    artist,
    gameId: '0',
    coverImageAssetId: imageAsset && imageAsset.id,
    trackAudioAssetId: audioAsset.id,
  };
  return { track, audioAsset, imageAsset }
}