// @flow strict

import { calculatePlaylistCurrentTrack } from "@astral-atlas/wildspace-models/room/audio";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { useAsync } from "../utils";
import { EditorForm, SelectEditor } from "../editor/form";

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { GameID, RoomID, RoomAudioState, PlaylistPlaybackState, PlaylistPlaybackTrack, AudioTrack } from "@astral-atlas/wildspace-models";
import type { GameData } from "./data";
import type { RoomClient } from "@astral-atlas/wildspace-client2";
import type { LocalAsset } from "../audio/track";
import type { RoomData } from "../room/data";

export type AudioStateEditorProps = {
  gameData: GameData,
  roomData: RoomData,
  client: { setAudio: RoomClient["setAudio"], ... },
};
*/

export const AudioStateEditor/*: Component<AudioStateEditorProps>*/ = ({
  gameData,
  roomData,
  client,
}) => {
  const { playlists } = gameData;
  const { playback } = roomData.audio;

  const updateAudioState = async (nextState) => {
    await client.setAudio(gameData.game.id, roomData.roomId, {
      ...roomData.audio,
      ...nextState,
    })
  }

  const onPlaylistIdChange = (playlistId) => {
    if (!playlistId)
      return updateAudioState({ playback: { type: 'none' }});
    const playlist = {
      id: playlistId,
      mode: { type: 'paused', progress: 0 }
    };
    return updateAudioState({ playback: { type: 'playlist', playlist }});
  }
  return h(EditorForm, {}, [
    h(SelectEditor, {
      label: 'Playlist ID',
      values: [...playlists.map(p => ({ value: p.id, title: p.title })), { value: '', title: 'None' }],
      selected: playback.type === 'playlist' && playback.playlist.id || '',
      onSelectedChange: onPlaylistIdChange
    }),
    playback.type === 'playlist' && [
      h(AudioPlaylistStateEditor, {
        roomId: roomData.roomId,
        volume: roomData.audio.volume,
        state: playback.playlist,
        gameData,
        client,
      })
    ]
  ])
};

export const useCurrentTrack = (
  state/*: PlaylistPlaybackState*/,
  tracks/*: $ReadOnlyArray<AudioTrack>*/,
  deps/*: mixed[]*/ = []
)/*: ?PlaylistPlaybackTrack*/ => {
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

export const useAudioPlayback = (
  ref/*: Ref<?HTMLAudioElement>*/,
  currentTrack/*: ?PlaylistPlaybackTrack*/,
  state/*: PlaylistPlaybackState*/,
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    const { current: audio } = ref;
    if (!audio || !currentTrack)
      return;
    const trackProgressSeconds = currentTrack.trackProgress / 1000;
    const trackDrift = Math.abs(trackProgressSeconds - audio.currentTime);

    if (trackDrift > 1)
      audio.currentTime = trackProgressSeconds;
    if (state.mode.type === "playing") {
      if (audio.paused) {
        audio.play()
          .catch((e) => console.log(e))
      }
    }
    else
      audio.pause();
  }, [currentTrack && currentTrack.index, currentTrack && currentTrack.trackProgress, ...deps])
}

/*::
export type AudioPlaylistStateEditorProps = {
  roomId: RoomID,
  state: PlaylistPlaybackState,
  volume: number,
  gameData: GameData,
  client: { setAudio: RoomClient["setAudio"], ... },
};
*/
export const AudioPlaylistStateEditor/*: Component<AudioPlaylistStateEditorProps>*/ = ({
  state,
  volume,
  gameData: { tracks, playlists, assets, game },
  client,
  roomId,
}) => {
  const activePlaylist = playlists.find(p => p.id === state.id);
  
  const activeTracks = activePlaylist && activePlaylist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean) || []

  const currentTrack = useCurrentTrack(state, activeTracks, [activePlaylist, tracks]);

  const onOffsetTrackIndex = (offset) => async () => {
    if (!activePlaylist || !currentTrack)
      return;
    const nextIndex = (currentTrack.index + offset + activeTracks.length) % activeTracks.length;
    const startTime = Date.now() - currentTrack.offsets[nextIndex] - 1000;
    const nextAudioState = {
      volume,
      playback: { type: "playlist", playlist: {
        ...state,
        mode: { type: "playing", startTime }
      } },
    }

    await client.setAudio(game.id, roomId, nextAudioState);
  };
  
  const currentAsset = currentTrack && assets.get(currentTrack.track.trackAudioAssetId);

  const audioRef = useRef/*:: <?HTMLAudioElement>*/();
  useAudioPlayback(audioRef, currentTrack, state)

  const onPlay = async (e) => {
    const { current: audio } = audioRef;
    if (!audio)
      return;
    const currentTrack = calculatePlaylistCurrentTrack(state, activeTracks, Date.now());
    if (!currentTrack)
      return;
    audio.currentTime = currentTrack.trackProgress / 1000;
  }
  const onStartClick = async () => {
    const nextAudioState = {
      volume,
      playback: { type: "playlist", playlist: {
        ...state,
        mode: { type: "playing", startTime: Date.now() }
      } },
    }

    await client.setAudio(game.id, roomId, nextAudioState);
  }
  const noopEvent = (e) => {
    e.preventDefault();
  }

  return [
    !!currentAsset && h('audio', { src: currentAsset.downloadURL, ref: audioRef, controls: true, onPlay, onSeeked: noopEvent, onSeeking: noopEvent, volume: 0 }),
    h(ProgressEditor, {
      state, activeTracks, tracks, playlists, currentTrack, volume, client, game, roomId
    }),
    h('div', {}, [
      h('button', { onClick: onOffsetTrackIndex(-1) }, 'Prev'),
      h('button', { onClick: onStartClick }, 'Start'),
      h('button', { onClick: onOffsetTrackIndex(+1) }, 'Next'),
    ]),
    h('div', {},
      h('ol', {}, activeTracks.map(track =>
        h('li', { style: { fontWeight: currentTrack && (track.id === currentTrack.track.id) ? 'bold' : 'normal' } }, track.title))))
  ];
}

const ProgressEditor = ({ state, activeTracks, tracks, playlists, currentTrack, volume, client, game, roomId }) => {
  const [editingProgress, setEditingProgress] = useState(false);

  const progressRef = useRef();
  useEffect(() => {
    const { current: progress } = progressRef;
    if (!progress || editingProgress)
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
  }, [state, tracks, playlists, editingProgress])

  const onInput = () => {
    setEditingProgress(true);
  }

  const onChange = async (e) => {
    setEditingProgress(false);

    const { current: progress } = progressRef;
    if (!progress || !currentTrack)
      return;
    const trackProgress = (progress.value / 100) * currentTrack.track.trackLengthMs;
    const playlistProgress = currentTrack.offsets[currentTrack.index] + trackProgress;
    const startTime = Date.now() - playlistProgress;
    const nextAudioState = {
      volume,
      playback: { type: "playlist", playlist: {
        ...state,
        mode: { type: "playing", startTime }
      } },
    }

    await client.setAudio(game.id, roomId, nextAudioState);
  }

  return h('input', { type: 'range', ref: progressRef, min: 0, max: 100, step: 0.001, onChange, onInput });
}