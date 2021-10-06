// @flow strict
/*:: import type { GameID, RoomID } from '@astral-atlas/wildspace-models'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-three';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createClient } from '@astral-atlas/sesame-client';

import { usePlaylistTrackData, RoomAudioPlayer } from "../components/RoomAudioPlayer.js";
import { useConnection } from "../hooks/connect.js";
import { clientContext, sesameContext } from "../hooks/context.js";
import { useStoredValue } from "../hooks/storage.js";
import { identityStore, roomStore } from "../lib/storage.js";

import styles from './room.module.css';
import { useAsync } from "../hooks/async.js";

const RoomAudio = ({ gameId, audio }) => {
  const [volume, setVolume] = useState(0);
  const tracksData = usePlaylistTrackData(gameId, audio.playlistId);

  return [
    h('form', { class: styles.volumeControls, onSubmit: e => e.preventDefault() }, [
      h('button', { onClick: e => setVolume(volume === 0 ? 0.5 : 0) }, volume === 0 ? 'unmute' : 'mute'),
      h('input', { type: 'range', value: volume, onInput: e => setVolume(e.target.value), max: 1, min: 0, step: 0.001 }),
    ]),
    h(RoomAudioPlayer, { tracksData, audio, volume })
  ];
};

const Room = ({ gameId, roomId, exit }) => {
  const client = useContext(clientContext)
  const [room] = useAsync(() => client.room.read(gameId, roomId), [client, roomId]);

  const { audio = null } = useConnection(async (u) => (await client.room.state.connect(gameId, roomId, u)).close, { audio: null });

  if (!room)
    return null;

  return [
    h('h1', {}, room.title),
    h('button', { onClick: exit }, 'Exit'),
    h('section', { class: styles.floatingLeftCorner }, [
      audio && h(RoomAudio, { gameId, audio })
    ])
  ];
};

const RoomSelection = ({ onRoomSelect, identity, setIdentity }) => {
  const client = useContext(clientContext)
  const sesame = useContext(sesameContext);
  const [gameId, setGameId] = useState/*:: <?GameID>*/(null);
  const [roomId, setRoomId] = useState/*:: <?RoomID>*/(null);

  const [games] = useAsync(() => client.game.list(), [client]);
  const [rooms] = useAsync(async () => gameId && client.room.list(gameId), [client, gameId]);

  const [user] = useAsync(async () => identity && sesame.user.get(identity.proof.userId), [sesame, identity]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (roomId && gameId)
      onRoomSelect({ gameId, roomId });
  };

  return [
    h('form', { onSubmit, class: styles.roomSelectForm }, [
      !identity && h('section', { class: styles.roomSelectLogin }, [
        h('p', {}, 'Authorize to join Wildspace'),
        h((AuthorizerFrame/*: any*/), {
          containerStyle: {},
          frameStyle: {},
          identityOrigin: 'http://sesame.astral-atlas.com',
          onIdentityGrant: ({ proof }) => setIdentity(v => ({ proof }))
        }),
      ]),
      !!identity && h('section', { class: styles.roomSelecIds }, [
        user  && h('p', {}, `Welcome, ${user.name}`) || null,
        h('select', { onChange: e => setGameId(e.target.value) }, games && [
          !gameId && h('option', { selected: true }, 'Select Game'),
          ...games.map(game => h('option', { value: game.id }, game.name))
        ]),
        h('select', { onChange: e => setRoomId(e.target.value), disabled: !rooms }, rooms && [
          !roomId && h('option', { selected: true }, 'Select Room'),
          ...rooms.map(room => h('option', { value: room.id }, room.title))
        ]),
        h('input', { type: 'submit', value: 'Join Room', disabled: !gameId || !roomId })
      ])
    ]),
  ]
};

const RoomPage = () => {
  const [identity, setIdentity] = useStoredValue(identityStore);
  const [roomData, setRoomData] = useStoredValue(roomStore);

  return [
    h('section', { class: styles.roomPage }, [
      !roomData && h('section', { class: styles.roomPageWall }, [
        h(RoomSelection, { onRoomSelect: d => setRoomData(v => d), identity, setIdentity })
      ]),
      roomData && h(Room, { roomId: roomData.roomId, gameId: roomData.gameId, exit: () => setRoomData(v => null) }) || null
    ]),
  ]
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  render(h(RoomPage), body);
};

main();