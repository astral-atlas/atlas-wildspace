// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";

import { clientContext, useAsync } from './hooks.js';
import { StringListEditor } from "./genericEditors.js";

import styles from './index.module.css';
import { calculateTrackDataSums, usePlaylistTrackData, RoomAudioPlayer } from "../components/RoomAudioPlayer.js";

const NewRoomEditor = ({ game, onCreate }) => {
  const client = useContext(clientContext);
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

const RoomStatePlaylistEditor = ({ game, onAudioChange, audio }) => {
  const tracksData = usePlaylistTrackData(game.id, audio.playlistId);
  const [currentTrack, setCurrentTrack] = useState(null);
  const trackLengthSums = calculateTrackDataSums(tracksData);
  const index = tracksData.findIndex(d => currentTrack && d.track.id === currentTrack.id);

  const restart = async () => {
    const playlistStartTime = Date.now() - (trackLengthSums[index - 1] || 0)
    onAudioChange({ ...audio, playlistStartTime });
  };
  const next = async () => {
    const playlistStartTime = Date.now() - (trackLengthSums[index] || 0);
    onAudioChange({ ...audio, playlistStartTime });
  }
  const back = async () => {
    const playlistStartTime = Date.now() - (trackLengthSums[index - 2] || 0);
    onAudioChange({ ...audio, playlistStartTime });
  }

  return [
    h('h2', {}, 'Room Preview'),
    h(RoomAudioPlayer, { tracksData, audio, onTrackChange: setCurrentTrack, controls: true }),
    h('ol', {}, tracksData.map((d, i) => h('li', { style: i === index ? activeStyle : {} }, `${d.track.title}`))),
    h('button', { onClick: () => restart() }, 'Restart'),
    h('button', { onClick: () => next() }, 'Next'),
    h('button', { onClick: () => back() }, 'Back'),
  ];
};

const RoomStateAudioEditor = ({ game, room, u }) => {
  const client = useContext(clientContext);
  const [playlists] = useAsync(() => client.audio.playlist.list(game.id), [client, u, game.id]);
  const [tracks] = useAsync(() => client.audio.tracks.list(game.id), [client, u, game.id]);
  
  const [state, setState] = useState(null);
  useEffect(() => {
    const connectionPromise = client.room.state.connect(game.id, room.id, setState)

    return async () => {
      const { close } = await connectionPromise;
      await close();
    }
  }, [])

  if (!state || !playlists || !tracks)
    return null;


  const onChange = async (e) => {
    const initialAudioState = {
      globalVolume: 1,
      playState: 'paused',
      trackIndex: 0,
    };
    const audio = {
      ...(state.audio || initialAudioState),
      playlistStartTime: Date.now(),
      playlistId: e.target.value
    }
    client.room.state.update(game.id, room.id, { ...state, audio })
  };

  const { audio } = state;

  const playlist = playlists.find(p => audio && (p.id === audio.playlistId))
  const onSubmit = (e) => {
    e.preventDefault();
  }
  const onAudioChange = async (newAudio) => {
    await client.room.state.update(game.id, room.id, { ...state, audio: newAudio })
  };
  
  return [
    h('form', { onSubmit }, [
      h('pre', {}, JSON.stringify(state, null, 2)),

      h('select', { onChange }, [
        !playlist && h('option', { selected: true }, 'None'),
        ...playlists.map(playlist =>
          h('option', {
            value: playlist.id,
            selected: audio && playlist.id === audio.playlistId
          }, playlist.title))
      ]),

      audio ? h(RoomStatePlaylistEditor, { game, audio, onAudioChange }) : null,
    ])
  ]
}

const ExistingRoomStateEditor = ({ game, room, u }) => {
  return [
    h('label', {}, ['Game ID', h('input', { type: 'text', disabled: true, value: JSON.stringify(room.id) })]),
    h(RoomStateAudioEditor, { game, room, u })
  ]
};

const ExistingRoomEditor = ({ roomId, game, onGameUpdate, u }) => {
  const client = useContext(clientContext);
  const [room] = useAsync(() => client.room.read(game.id, roomId), [client, u, game.id, roomId])

  if (!room)  
    return null;

  return [
    h(ExistingRoomStateEditor, { game, room, u })
  ];
};

export const RoomEditor/*: Component<{ u: number, game: Game, onGameUpdate: () => mixed }>*/ = ({ u, game, onGameUpdate }) => {
  const client = useContext(clientContext);
  const [roomId, setRoomId] = useState(null);
  const [rooms] = useAsync(() => client.room.list(game.id), [client, u, game.id])

  if (!rooms)
    return null;

  const onCreate = (room) => {
    setRoomId(room.id);
    onGameUpdate()
  };

  return [
    h('h3', {}, 'Room Editor'),
    h('div', {}, [
      h('button', { onClick: () => setRoomId(null), disabled: roomId === null }, 'Create New Room'),
      ...rooms.map(room => h('button', { onClick: () => setRoomId(room.id), disabled: roomId === room.id }, `Edit ${room.title}`))
    ]),
    roomId === null && h(NewRoomEditor, { game, onCreate }),
    roomId !== null && h(ExistingRoomEditor, { roomId, game, onGameUpdate, u,  })
  ];
};