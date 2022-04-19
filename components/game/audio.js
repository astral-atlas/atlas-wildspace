// @flow strict

import { calculatePlaylistCurrentTrack } from "@astral-atlas/wildspace-models/room/audio";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { useAsync } from "../utils";

/*::
import type { Component } from "@lukekaalim/act";
import type { GameID, RoomID, RoomAudioState, PlaylistPlaybackState } from "@astral-atlas/wildspace-models";
import type { GameData } from "./data";
import type { RoomClient } from "@astral-atlas/wildspace-client2";
import type { LocalAsset } from "../audio/track";

export type AudioStateEditorProps = {
  gameId: GameID,
  roomId: RoomID,
  state: RoomAudioState,
  gameData: { playlists: GameData["playlists"], tracks: GameData["tracks"], ... },
  assets: LocalAsset[],
  client: { setAudio: RoomClient["setAudio"], ... },
};
*/

export const AudioStateEditor/*: Component<AudioStateEditorProps>*/ = ({
  state,
  gameData,
  assets,
  client,
  gameId,
  roomId,
}) => {
  const { playlists } = gameData;
  const { playback } = state;
  const onPlaylistChange = async (e) => {
    client.setAudio(gameId, roomId, {
      ...state,
      volume: 0,
      playback: {
        type: 'playlist',
        playlist: {
          id: e.target.value,
          mode: { type: "paused", progress: 0 }
        }
      }
    })
  }
  switch (playback.type) {
    case 'none':
      return ['None']
    case 'playlist':
      const playlist = playback.playlist;
      return [
        h('select', { onChange: onPlaylistChange }, playlists.map(p =>
          h('option', { value: p.id, selected: p.id === playlist.id }, p.title))),
        h(AudioPlaylistStateEditor, {
          volume: state.volume,
          state: playlist,
          gameData,
          assets,
          gameId,
          roomId,
          client,
        })
      ]
  }
};

const useCurrentTrack = (state, tracks, deps) => {
  const [currentTrack, setCurrentTrack] = useState(
    calculatePlaylistCurrentTrack(state, tracks, Date.now())
  )
  useEffect(() => {
    const currentTrack = calculatePlaylistCurrentTrack(state, tracks, Date.now());
    if (!currentTrack)
      return;

    setCurrentTrack(currentTrack);

    const update = () => {
      const nextTrack = calculatePlaylistCurrentTrack(state, tracks, Date.now());
      setCurrentTrack(nextTrack);
      if (!nextTrack)
        return;
      const remainingTrackTime = nextTrack.track.trackLengthMs - nextTrack.trackProgress;
      id = setTimeout(update, remainingTrackTime);
    };
    let id = setTimeout(update, currentTrack.track.trackLengthMs - currentTrack.trackProgress);

    return () => {
      clearTimeout(id);
    }
  }, [state, ...deps])

  return currentTrack;
}

/*::
export type AudioPlaylistStateEditorProps = {
  gameId: GameID,
  roomId: RoomID,
  state: PlaylistPlaybackState,
  volume: number,
  gameData: { playlists: GameData["playlists"], tracks: GameData["tracks"], ... },
  assets: LocalAsset[],
  client: { setAudio: RoomClient["setAudio"], ... },
};
*/
export const AudioPlaylistStateEditor/*: Component<AudioPlaylistStateEditorProps>*/ = ({
  state,
  volume,
  gameData: { tracks, playlists },
  assets,
  client,
  gameId,
  roomId,
}) => {
  const activePlaylist = playlists.find(p => p.id === state.id);
  
  const activeTracks = activePlaylist && activePlaylist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean) || []

  const currentTrack = useCurrentTrack(state, activeTracks, [activePlaylist, tracks]);

  const progressRef = useRef();
  useEffect(() => {
    const { current: progress } = progressRef;
    if (!progress)
      return;
    const anim = () => {
      const currentTrack = calculatePlaylistCurrentTrack(state, activeTracks, Date.now());
      if (!currentTrack)
        return;
      progress.value = (currentTrack.trackProgress / currentTrack.track.trackLengthMs) * 100;
      id = requestAnimationFrame(anim);
    }
    let id = requestAnimationFrame(anim);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [state, tracks, playlists])

  const onOffsetTrackIndex = (offset) => async () => {
    if (!activePlaylist || !currentTrack)
      return;
    const nextIndex = (currentTrack.index + offset + activeTracks.length) % activeTracks.length;
    const startTime = Date.now() - currentTrack.offsets[nextIndex]
    const nextAudioState = {
      volume,
      playback: { type: "playlist", playlist: {
        ...state,
        mode: { type: "playing", startTime }
      } },
    }

    await client.setAudio(gameId, roomId, nextAudioState);
  };
  
  const currentAsset = assets.find(a => currentTrack && currentTrack.track.trackAudioAssetId === a.id);
  const audioRef = useRef();
  useEffect(() => {
    const { current: audio } = audioRef;
    if (!audio || !currentTrack)
      return;
    const trackProgressSeconds = currentTrack.trackProgress / 1000;
    const trackDrift = Math.abs(trackProgressSeconds - audio.currentTime);
    if (trackDrift > 0.2)
      audio.currentTime = trackProgressSeconds;
    if (state.mode.type === "playing")
      audio.play()
        .catch((e) => console.log(e))
  }, [currentTrack && currentTrack.index, currentTrack && currentTrack.trackProgress, currentAsset])
  const onPlay = async (e) => {
    const { current: audio } = audioRef;
    if (!audio)
      return;
    const currentTrack = calculatePlaylistCurrentTrack(state, activeTracks, Date.now());
    if (!currentTrack)
      return;
    audio.currentTime = currentTrack.trackProgress / 1000;
  }
  const onSeeked = async (e) => {
    const { current: audio } = audioRef;
    if (!audio || !currentTrack)
      return;
    const trackProgress = audio.currentTime * 1000;
    const progress = currentTrack.offsets[currentTrack.index] + trackProgress;
    const startTime = Date.now() - progress;
    const nextAudioState = {
      volume,
      playback: { type: "playlist", playlist: {
        ...state,
        mode: { type: "playing", startTime }
      } },
    }

    await client.setAudio(gameId, roomId, nextAudioState);
  }

  console.log(currentAsset, currentTrack)
  console.log(assets)

  return [
    !!currentAsset && h('audio', { src: currentAsset.url, ref: audioRef, controls: true, onSeeked, onPlay }),
    h('progress', { ref: progressRef, min: 0, max: 100, step: 0.001 }),
    h('div', {}, [
      h('button', { onClick: onOffsetTrackIndex(-1) }, 'Prev'),
      h('button', {}, 'Pause'),
      h('button', { onClick: onOffsetTrackIndex(+1) }, 'Next'),
    ]),
    h('div', {},
      h('ol', {}, activeTracks.map(track =>
        h('li', { style: { fontWeight: currentTrack && (track.id === currentTrack.track.id) ? 'bold' : 'normal' } }, track.title))))
  ];
}