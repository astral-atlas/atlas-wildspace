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
import { MapScene } from "./RoomMapScene.js";
import { useWildspaceState } from "../hooks/app.js";
import { GameMasterEncounterInitiativeControls } from "../../components/initiative/controls";
import { CharacterSheet2 } from "../characters/CharacterSheet2";

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

const useMiniImageURLMap = (state, characters) => {
  const api = useAPI();

  const [miniImageURLMap] = useAsync(async () => {
    if (!state)
      return;
    return Object.fromEntries(await Promise.all(state.minis.map(async (mini) => {
      switch(mini.type) {
        case 'character':
          const character = characters.find(c => c.id === mini.characterId);
          const characterAsset = character && character.initiativeIconAssetId && await api.asset.peek(character.initiativeIconAssetId);
          return [mini.id, characterAsset && characterAsset.downloadURL.href || null]
        case 'monster':
          const monsterAsset = mini.iconAssetId && await api.asset.peek(mini.iconAssetId);
          return [mini.id, monsterAsset && monsterAsset.downloadURL.href || null]
      }
    })));
  }, [state, characters])

  return miniImageURLMap || {};
}

const RoomTracker = ({ gameData, state, game, room, selectedMinis, setSelectedMinis, miniImageURLMap }) => {
  const api = useAPI();
  const { proof: { userId } } = useWildspaceState();
  const { encounters, characters } = gameData;

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
        miniImageURLMap,
      }),
      isGM ?
        h(GameMasterEncounterInitiativeControls, {
          api,
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

const getMiniName = (characters, minis, miniId) => {
  const mini = minis.find(m => m.id === miniId);
  if (!mini)
    return '';
  switch (mini.type) {
    case 'monster':
      return mini.name;
    case 'character':
      const character = characters.find(c => c.id === mini.characterId);
      return character ? character.name : '';
  }
};

const Room = ({ view, game, room, gameData, volume }) => {
  const api = useAPI();
  const ref = useRef();
  const mapViewRef = useRef/*:: <?HTMLElement>*/();
  const [selectedMinis, setSelectedMinis] = useState([]);

  const [zoom, setZoom] = useState(1);

  const { audio, encounter } = useRoom(game.id, room.id);
  const { playlists, tracks, characters } = gameData;

  const playlist = audio && playlists.find(p => p.id === audio.playlistId);
  const playlistTracks = playlist && playlist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean);
  

  const offset = getOffset(view)

  const [roomSize, setRoomSize] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const { current } = ref;
    if (!current)
      return;

    const onSizeChange = () => {
      setRoomSize({ x: current.offsetWidth, y: current.offsetHeight });
    };
    new ResizeObserver(onSizeChange).observe(current)
  }, []);

  const miniImageURLMap = useMiniImageURLMap(encounter, characters);

  return [
    h('div', { className: styles.room, ref }, [
      audio && playlistTracks && h(PlaylistPlayer, { state: audio, tracks: playlistTracks, volume }) || null,
      encounter && h('div', { className: styles.mapScene },
        h(MapScene, {
          height: roomSize.y,
          width: roomSize.x,
          zoom,
          encounter,
          mapViewRef,
          selectedMinis,
          setSelectedMinis,
          miniImageURLMap,
          onSubmitActions: actions => api.room.performEncounterActions(game.id, room.id, actions)
        })) || null,
      h('div', { className: styles.roomViewContainer, style: { transform: `translateX(${offset})`} }, [
        h('div', { className: styles.trackerView }, h(RoomTracker, { miniImageURLMap, game, room, gameData, state: encounter, selectedMinis, setSelectedMinis })),
        h('div', { className: styles.mapView, ref: mapViewRef, onWheel: e => setZoom(Math.min(2, Math.max(1, zoom - (e.deltaY * 0.001)))) }, [
          encounter && h('ul', {}, selectedMinis.map(m => h('li', {}, getMiniName(characters, encounter.minis, m)))) || null,
        ]),
        h('div', { className: styles.referenceView }, h(ReferenceView, { game, gameData })),
      ])
    ])
  ];
};

const ReferenceView = ({ gameData, game }) => {
  const { characters, players } = gameData;
  const { proof } = useWildspaceState();
  const myCharacters = characters.filter(c => c.playerId !== game.gameMasterId)

  return [
    h('div', { style: { overflowX: 'scroll' } }, [
      h('span', { style: { display: 'flex', flexDirection: 'row' }}, [
        myCharacters.map(character => h('span', { style: { margin: '0 16px 0 16px' }}, h(CharacterSheet2, { character, disabled: true, game })))
      ])
    ]),
  ];
}

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

const RoomPageViewSwitcher = ({ view, onViewChange, audio, encounter }) => {
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
    encounter && { value: 'tracker', label: 'Tracker' },
    { value: 'map', label: 'Map' },
    { value: 'reference', label: 'Reference' },
  ].filter(Boolean);

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
  
  const { audio, encounter } = useRoom(gameId, roomId);

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
          game && room && h('nav', {},h(RoomPageViewSwitcher, { view, onViewChange: setView, encounter, audio })) || null,
        ],
        right: [
          audio && audio.playlistId && h(RoomAudio, { volume, onVolumeChange: setVolume }) || null
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