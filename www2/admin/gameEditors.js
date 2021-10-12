// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { clientContext, useAsync } from './hooks.js';

import styles from './index.module.css';

import { StringListEditor } from './genericEditors.js';
import { TracksEditor } from './trackEditors.js';
import { RoomEditor } from "./roomEditors.js";
import { PlaylistEditor } from "./playlistEditors.js";
import { useAPI } from "../hooks/api";


const NewGameEditor = ({ onCreate }) => {
  const client = useContext(clientContext);
  const [newGame, setNewGame] = useState({ name: '', playerIds: [] })

  const onSubmit = async (e) => {
    e.preventDefault();
    onCreate(await client.game.create(newGame.name));
  }

  return [
    h('form', { class: styles.simpleEditorForm, onSubmit }, [
      h('label', {}, ['Name', h('input', { type: 'text', onChange: e => setNewGame(v => ({ ...v, name: e.target.value })), value: newGame.name })]),
      //h('label', {}, ['PlayerIds',
      //  h(StringListEditor, { values: newGame.playerIds, onChange: playerIds => setNewGame(v => ({ ...v, playerIds })), valueName: 'Player ID' }),
      //]),
      h('input', { type: 'submit', value: 'Add New game' }),
    ])
  ]
};

const ExistingGameEditor = ({ gameId, onGameUpdate, u }) => {
  const api = useAPI();
  const [game] = useAsync(() => api.game.read(gameId), [api, u, gameId])
  const [players] = useAsync(() => api.game.players.list(gameId), [api, u, gameId])

  const subEditors = ['tracks', 'playlists', 'rooms'];
  const [subEditor, setSubEditor] = useState('tracks');

  console.log('rendering', game, players);

  if (!game || !players)
    return null;

  const onSubmit = async (e) => {
    e.preventDefault();
  }
  const updateGame = async (updatedGame) => {
    await api.game.update(game.id, updatedGame);
    onGameUpdate();
  };
  const onPlayersChange = async (newPlayers) => {
    const oldPlayerIds = players.map(p => p.userId);

    const addedPlayers = newPlayers.filter(p => !oldPlayerIds.includes(p));
    const removedPlayers = oldPlayerIds.filter(p => !newPlayers.includes(p));

    for (const removedPlayer of removedPlayers)
      await api.game.players.remove(game.id, removedPlayer);
    for (const addedPlayer of addedPlayers)
      await api.game.players.add(game.id, addedPlayer);
    onGameUpdate();
  };

  return [
    h('form', { onSubmit, class: styles.simpleEditorForm }, [
      h('label', {}, ['Game ID', h('input', { type: 'text', disabled: true, value: JSON.stringify(gameId) })]),
      h('label', {}, ['Name', h('input', { type: 'text', onChange: e => updateGame({ name: e.target.value }), value: game.name })]),
      h('label', {}, ['PlayerIds',
        h(StringListEditor, { values: players.map(p => p.userId), onChange: onPlayersChange, valueName: 'Player ID' }),
      ]),
    ]),
    h('div', {}, subEditors.map(s => h('button', { onClick: () => setSubEditor(s), disabled: s === subEditor }, s))),
    subEditor === 'tracks' && h(TracksEditor, { game, u, onGameUpdate }),
    subEditor === 'rooms' && h(RoomEditor, { game, u, onGameUpdate }),
    subEditor === 'playlists' && h(PlaylistEditor, { game, u, onGameUpdate }),
  ]
};

export const GamesEditor/*: Component<{ u: number, setU: number => void }>*/ = ({ u, setU }) => {
  const client = useAPI();
  const [gameId, setGameId] = useState(null);
  const [allGames] = useAsync(() => client.game.list(), [client, u])

  return [
    h('h2', {}, 'Game Editor'),
    h('div', {}, [
      h('button', { onClick: () => setGameId(null), disabled: gameId === null }, 'Create New Game'),
      ...(allGames || []).map(game => h('button', { onClick: () => setGameId(game.id), disabled: gameId === game.id }, `Edit ${game.name}`))
    ]),
    gameId === null ?
      h(NewGameEditor, { onCreate: game => (setGameId(game.id), setU(Date.now())) }) :
      h(ExistingGameEditor, { gameId, onGameUpdate: () => setU(Date.now()), u })
  ]
};