// @flow strict
/*:: import type { GameID, RoomID } from '@astral-atlas/wildspace-models'; */
/*:: import type { AuthorizerFrameProps } from '@astral-atlas/sesame-components'; */
/*:: import type { Component } from "@lukekaalim/act"; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { C, render } from '@lukekaalim/act-three';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';
import { EncounterInitiativeControls, EncounterInitiativeTracker } from "@astral-atlas/wildspace-components";

import { usePlaylistTrackData, RoomAudioPlayer, PlaylistPlayer } from "../components/RoomAudioPlayer.js";
import { useConnection } from "../hooks/connect.js";
import { clientContext, sesameContext } from "../hooks/context.js";
import { useStoredValue } from "../hooks/storage.js";
import { identityStore, roomStore } from "../lib/storage.js";

import styles from './room.module.css';
import { useAsync } from "../hooks/async.js";
import { loadConfig } from "../config";
import { IdentityProvider, useIdentity, useMessenger } from "../hooks/identity.js";
import { WildspaceApp, renderDocument } from "../app.js";
import { useAPI, useGame, useRoom } from "../hooks/api.js";
import { useNavigation } from "../hooks/navigation.js";
import { WildspaceHeader } from "../components/Header.js";
import { useURLParam } from "../hooks/navigation";
import { SpinningZeroCube } from "./RoomMapScene.js";
import { useWildspaceState } from "../hooks/app.js";
import { GameMasterEncounterInitiativeControls } from "../../components/initiative/controls";

const RoomAudio = ({ volume, onVolumeChange }) => {
  const buttonClassNames = [
    volume === 0 && styles.muted,
    styles.volumeControlsMuteToggle,
  ].filter(Boolean).join(' ');

  return [
    h('div', { className: styles.volumeControls }, [
      h('button', { className: buttonClassNames, onClick: e => onVolumeChange(volume === 0 ? 0.5 : 0) }, h('span', {}, volume === 0 ? 'unmute' : 'mute')),
      h('input', { type: 'range', value: volume, onInput: e => onVolumeChange(e.target.value), max: 1, min: 0, step: 0.001 }),
    ]),
  ];
};

const getOffset = (view) => {
  switch (view) {
    case 'tracker':
      return '0vw';
    case 'map':
      return '-75vw'
    case 'reference':
      return '-150vw';
  }
}

const RoomTracker = ({ gameData, state, game, room }) => {
  const api = useAPI();
  const { proof: { userId } } = useWildspaceState();
  const { encounters, characters } = gameData;
  const [selectedMinis, setSelectedMinis] = useState([]);

  if (!state)
    return null;
  const encounter = encounters.find(e => e.id === state.encounterId);
  if (!encounter)
    return null;

  const isGM = userId === game.gameMasterId;

  return [
    h('div', { className: styles.initiative }, [
      h(EncounterInitiativeTracker, {
        className: styles.tracker,
        characters, selectedMinis,
        encounter,
        encounterState: state,
        onSelectedMinisChange: setSelectedMinis,
        gameMaster: isGM,
      }),
      isGM ?
        h(GameMasterEncounterInitiativeControls, {
          className: styles.controls,
          characters, monsters: [], selectedMinis, state,
          onStateUpdate: encounter => api.room.setEncounter(game.id, room.id, encounter),
          onSubmitActions: actions => api.room.performEncounterActions(game.id, room.id, actions)
        }) :
        h(EncounterInitiativeControls, {
          className: styles.controls,
          selectedMinis,
          encounter,
          encounterState: state,
          onSubmitActions: actions => api.room.performEncounterActions(game.id, room.id, actions)
        }),
    ])
  ]
};

const Room = ({ view, game, room, gameData, volume }) => {
  const api = useAPI();

  const { audio, encounter } = useRoom(game.id, room.id);
  const { playlists, tracks } = gameData;

  const playlist = audio && playlists.find(p => p.id === audio.playlistId);
  const playlistTracks = playlist && playlist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean);

  const offset = getOffset(view)

  return [
    h('div', { className: styles.room }, [
      h('div', { className: styles.mapScene }, h(C.three, { height: 512, width: 512 }, h(SpinningZeroCube))),
      h('div', { className: styles.roomViewContainer, style: { transform: `translateX(${offset})`} }, [
        h('div', { className: styles.trackerView }, h(RoomTracker, { game, room, gameData, state: encounter })),
        h('div', { className: styles.mapView }, [
          audio && playlistTracks && h(PlaylistPlayer, { state: audio, tracks: playlistTracks, volume }) || null
        ]),
        h('div', { className: styles.referenceView }, 'right'),
      ])
    ])
  ];
};

const getCodeDelta = (e) => {
  if (!e.ctrlKey)
    return 0;
  switch (e.code) {
    case 'ArrowLeft':
      return -1;
    case 'ArrowRight':
      return +1;
    default:
      return 0;
  }
}

const RoomPageViewSwitcher = ({ view, onViewChange }) => {
  useEffect(() => {
    const listener = (e/*: KeyboardEvent*/) => {
      const viewIndex = views.findIndex(v => v.value === view);
      const delta = getCodeDelta(e);
      if (delta === 0)
        return;
      const nextViewIndex = Math.abs((views.length + (viewIndex + delta)) % views.length);
      onViewChange(views[nextViewIndex].value);
    };
    document.addEventListener('keyup', listener);
    return () => {
      document.removeEventListener('keyup', listener);
    };
  }, [view]);

  const views = [
    { value: 'tracker', label: 'Tracker' },
    { value: 'map', label: 'Map' },
    { value: 'reference', label: 'Reference' },
  ];

  return [
    h('menu', { className: styles.roomViewSwitcher }, [
      ...views.map(v => h('li', {}, h('button', { disabled: v.value === view, onClick: () => onViewChange(v.value) }, v.label)))
    ])
  ]
};

const RoomPage = () => {
  const api = useAPI();
  const [view, setView] = useState('map');
  const [gameId, setGameId] = useURLParam('gameId');
  const [roomId, setRoomId] = useURLParam('roomId');

  const [volume, setVolume] = useState(0);

  const [games] = useAsync(async () => api.game.list(), [api]);
  const { rooms, ...gameData } = useGame(gameId);

  if (!games)
    return null;

  const game = games && games.find(g => g.id === gameId);
  const room = rooms && rooms.find(r => r.id === roomId);

  return [
    h('section', { class: styles.roomPage }, [
      h(WildspaceHeader, {
        left: [
          h('div', { style: { display: 'flex', flexDirection: 'column' }}, [
            h('select', { value: gameId, onChange: e => (setGameId(e.target.value), setRoomId(null)) }, [
              h('option', { selected: gameId === null, value: null }, '<No Game>'),
              games.map(g => h('option', { value: g.id, selected: g.id === gameId }, g.name)),
            ]),
            h('select', { value: roomId, onChange: e => (setRoomId(e.target.value))}, [
              h('option', { selected: roomId === null, value: null }, '<No Room>'),
              rooms ? rooms.map(r => h('option', { value: r.id, selected: r.id === roomId }, r.title)) : null
            ]),
          ])
        ],
        center: [
          game && room && h('nav', {},h(RoomPageViewSwitcher, { view, onViewChange: setView })) || null,
        ],
        right: [
          h(RoomAudio, { volume, onVolumeChange: setVolume })
        ]
      }),
      //!roomData && h('section', { class: styles.roomPageWall }, [
        //h(RoomSelection, { onRoomSelect: d => setRoomData(v => d), identity, setIdentity })
      //]),
      game && room && h(Room, { view, game, room, gameData, volume }) || null,
    ]),
  ];
};


renderDocument(h(WildspaceApp, { initialURL: new URL(document.location.href) }, h(RoomPage)));