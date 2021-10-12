// @flow strict
/*:: import type { GameID, RoomID } from '@astral-atlas/wildspace-models'; */
/*:: import type { AuthorizerFrameProps } from '@astral-atlas/sesame-components'; */
/*:: import type { Component } from "@lukekaalim/act"; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-three';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

import { usePlaylistTrackData, RoomAudioPlayer } from "../components/RoomAudioPlayer.js";
import { useConnection } from "../hooks/connect.js";
import { clientContext, sesameContext } from "../hooks/context.js";
import { useStoredValue } from "../hooks/storage.js";
import { identityStore, roomStore } from "../lib/storage.js";

import styles from './room.module.css';
import { useAsync } from "../hooks/async.js";
import { loadConfig } from "../config";
import { IdentityProvider, useIdentity, useMessenger } from "../hooks/identity.js";

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
  const [room, roomError] = useAsync(() => client.room.read(gameId, roomId), [client, roomId]);

  const { audio = null } = useConnection(async (u) => (await client.room.state.connect(gameId, roomId, u)).close, { audio: null });

  if (roomError) {
    return [
      h('h1', {}, 'oops!'),
      h('button', { onClick: () => exit() }, 'back to home'),
    ]
  }

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

const RoomSelection = ({ onRoomSelect, identity }) => {
  const client = useContext(clientContext)
  const sesame = useContext(sesameContext);
  const [gameId, setGameId] = useState/*:: <?GameID>*/(null);
  const [roomId, setRoomId] = useState/*:: <?RoomID>*/(null);

  const [games, gameError] = useAsync(() => client.game.list(), [client]);
  const [rooms, roomError] = useAsync(async () => gameId && client.room.list(gameId), [client, gameId]);

  const [user, userError] = useAsync(async () => identity && sesame.user.get(identity.proof.userId), [sesame, identity]);

  const messenger = useMessenger();

  if (gameError || roomError || userError) {
    return [
      h('h1', {}, 'oops!'),
      h('button', { onClick: () => (setGameId(null), setRoomId(null)) }, 'back to home'),
    ]
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (roomId && gameId)
      onRoomSelect({ gameId, roomId });
  };

  const onLoginClick = () => {
    if (!messenger)
      return;
    messenger.send({ type: 'sesame:prompt-link-grant' });
  }

  return [
    h('form', { onSubmit, class: styles.roomSelectForm }, [
      !identity && h('section', { class: styles.roomSelectLogin }, [
        h('p', {}, [
          'You need to be logged into ',
          h('a', { href: 'http://sesame.astral-atlas.com', target: '_blank' }, 'Astral Atlas'),
          ' to proceed.'
        ]),
        messenger && h('button', { onClick: onLoginClick }, 'Try Again'),
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

const RoomPage = ({ config }) => {
  const [identity, setIdentity] = useIdentity();
  const [roomData, setRoomData] = useStoredValue(roomStore);

  const client = createWildspaceClient(identity && identity.proof, config.api.wildspace.httpOrigin);

  return [
    h(clientContext.Provider, { value: client }, [
      h('section', { class: styles.roomPage }, [
        !roomData && h('section', { class: styles.roomPageWall }, [
          h(RoomSelection, { onRoomSelect: d => setRoomData(v => d), identity, setIdentity })
        ]),
        roomData && h(Room, { roomId: roomData.roomId, gameId: roomData.gameId, exit: () => setRoomData(v => null) }) || null
      ]),
    ]),
  ]
};

const main = async () => {
  const { body } = document;
  if (!body)
    throw new Error();
  const config = await loadConfig()
  render(h(IdentityProvider, {}, h(RoomPage, { config })), body);
};

main();