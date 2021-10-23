// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { GameData } from '../hooks/api.js'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";

import { clientContext, useAsync } from './hooks.js';
import { StringListEditor } from "./genericEditors.js";

import styles from './index.module.css';
import { calculateTrackDataSums, usePlaylistTrackData, RoomAudioPlayer, PlaylistPlayer } from "../components/RoomAudioPlayer.js";
import { useAPI } from "../hooks/api.js";
import { useURLParam } from "../hooks/navigation.js";
import { useRoom } from "../hooks/api";
import {
  MultiSelectInput,
  SelectInput,
  TextInput,
} from "@astral-atlas/wildspace-components";
import {
  calculateTrackIntervals,
  usePlaybackData2,
} from "../components/RoomAudioPlayer";

const NewRoomEditor = ({ game, onCreate }) => {
  const client = useAPI();
  const [newRoom, setNewRoom] = useState({ title: '' })

  const onSubmit = async (e) => {
    e.preventDefault();
    onCreate(await client.room.create(game.id, newRoom.title));
  }

  return [
    h('form', { class: styles.simpleEditorForm, onSubmit }, [
      h('label', {}, ['Title', h('input', { type: 'text', onChange: e => setNewRoom(v => ({ ...v, title: e.target.value })), value: newRoom.title })]),
      h('input', { type: 'submit', value: 'Add New Room' }),
    ])
  ]
};

const activeStyle = {
  fontWeight: 'bold'
};

const RoomStatePlaylistEditor = ({ game, room, gameData, audio }) => {
  const api = useAPI();
  const { playlists, tracks } = gameData;

  const playlist = playlists.find(p => p.id === audio.playlistId);
  const playlistTracks = playlist && playlist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean);

  if (!playlistTracks)
    return null;

  const intervals = calculateTrackIntervals(playlistTracks);
  const { currentTime, trackIndex } = usePlaybackData2(playlistTracks, audio);

  const restart = async () => {
    const playlistStartTime = Date.now() - (intervals[trackIndex - 1] || 0)
    await api.room.setAudio(game.id, room.id, { ...audio, playlistStartTime });
  };
  const next = async () => {
    const playlistStartTime = Date.now() - (intervals[trackIndex] || 0);
    await api.room.setAudio(game.id, room.id, { ...audio, playlistStartTime });
  }
  const back = async () => {
    const playlistStartTime = Date.now() - (intervals[trackIndex - 2] || 0);
    console.log(intervals[trackIndex - 2])
    await api.room.setAudio(game.id, room.id, { ...audio, playlistStartTime });
  }

  return [
    h('h2', {}, 'Room Preview'),
    playlistTracks && h(PlaylistPlayer, { tracks: playlistTracks, state: audio }),
    h('ol', {}, playlistTracks.map((t, i) => h('li', { style: i === trackIndex ? activeStyle : {} }, t.title))),
    h('button', { onClick: () => restart() }, 'Restart'),
    h('button', { onClick: () => next() }, 'Next'),
    h('button', { onClick: () => back() }, 'Back'),
  ];
};

const RoomStateAudioEditor = ({ game, room, audio, gameData }) => {
  const api = useAPI();
  const { playlists, tracks } = gameData;
  

  const onChange = async (playlistId) => {
    const audio = {
      globalVolume: 1,
      playState: 'paused',
      trackIndex: 0,
      playlistStartTime: Date.now(),
      playlistId
    }
    api.room.setAudio(game.id, room.id, playlistId ? audio : null);
  };

  const playlist = playlists.find(p => audio && (p.id === audio.playlistId))
  
  return [
    h(SelectInput, {
      label: 'Playlist ID',
      values: ['', ...playlists.map(p => p.id)],
      value: audio ? audio.playlistId : '',
      getOptionLabel: id => playlists.find(p => p.id === id)?.title || 'No Playlist',
      onChange
    }),

    audio && playlist ? h(RoomStatePlaylistEditor, { game, audio, room, playlist, gameData }) : null,
  ]
}

const RoomEncounterStateEditor = ({ game, room, encounter, gameData }) => {
  const api = useAPI();
  const { encounters } = gameData;

  return [
    h(SelectInput, {
      values: [...encounters.map(e => e.id), ''],
      label: 'encounterId',
      value: encounter ? encounter.encounterId : '',
      getOptionLabel: id => encounters.find(e => e.id === id)?.name || 'No Encounter',
      onChange: encounterId => api.room.setEncounter(game.id, room.id, encounterId ? {
        encounterId,
        minis: [],
        round: 0,
        turnIndex: 0,
        turnOrder: [],
      } : null)
    })
  ];
}

const ExistingRoomStateEditor = ({ game, room, gameData }) => {
  const { audio, encounter } = useRoom(game.id, room.id);
  const api = useAPI();

  return [
    h('label', {}, ['Game ID', h('input', { type: 'text', disabled: true, value: JSON.stringify(room.id) })]),
    h(TextInput, { value: room.title, label: 'title', onChange: title => api.room.update(game.id, room.id, { ...room, title }) }),
    h('pre', {}, JSON.stringify({ room, audio, encounter }, null, 2)),
    h(RoomStateAudioEditor, { game, room, audio, gameData }),
    h(RoomEncounterStateEditor, { game, room, encounter, gameData }),
  ]
};

const ExistingRoomEditor = ({ room, game, gameData }) => {
  if (!room)  
    return null;

  return [
    h(ExistingRoomStateEditor, { game, room, gameData }),
  ];
};

export const RoomEditor/*: Component<{ game: Game, gameData: GameData }>*/ = ({ game, gameData }) => {
  const client = useAPI();
  const [roomId, setRoomId] = useURLParam("roomId");
  const { rooms } = gameData;

  const onCreate = (room) => {
    setRoomId(room.id);
  };

  const room = rooms.find(r => r.id === roomId);

  return [
    h('h3', {}, 'Room Editor'),
    h('div', {}, [
      h('button', { onClick: () => setRoomId(null), disabled: roomId === null }, 'Create New Room'),
      ...rooms.map(room => h('button', { onClick: () => setRoomId(room.id), disabled: roomId === room.id }, `Edit ${room.title}`))
    ]),
    !room && h(NewRoomEditor, { game, onCreate }),
    room && h(ExistingRoomEditor, { room, game, gameData }) || null
  ];
};