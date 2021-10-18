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
import { useAPI, useGame } from "../hooks/api";
import { useNavigation, useURLParam } from "../hooks/navigation.js";
import { EncounterEditor } from "./encounterEditor.js";


const NewGameEditor = ({ onCreate }) => {
  const client = useAPI();
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
  const nav = useNavigation();
  const [game] = useAsync(() => api.game.read(gameId), [api, u, gameId])
  const gameData = useGame(gameId)
  const { players, encounters, characters } = gameData;

  const subEditors = ['tracks', 'playlists', 'rooms', 'encounters', 'monsters', 'characters'];
  const [subEditor] = useURLParam('editor');

  const changeEditor = (newEditor) => {
    const nextURL = new URL(nav.url.href);
    nextURL.searchParams.delete('trackId');
    nextURL.searchParams.delete('playlistId');
    nextURL.searchParams.delete('roomId');
    nextURL.searchParams.delete('encounterId');
    nextURL.searchParams.delete('monstersId');
    nextURL.searchParams.delete('charactersId');
    nextURL.searchParams.set('editor', newEditor);
    nav.navigate(nextURL);
  }

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
    h('div', {}, subEditors.map(s => h('button', { onClick: () => changeEditor(s), disabled: s === subEditor }, s))),
    subEditor === 'tracks' && h(TracksEditor, { game, u, onGameUpdate }),
    subEditor === 'rooms' && h(RoomEditor, { game, gameData, onGameUpdate }),
    subEditor === 'playlists' && h(PlaylistEditor, { game, u, onGameUpdate }),
    subEditor === 'encounters' && h(EncounterEditor, { game, encounters, characters }),
  ]
};

export const GamesEditor/*: Component<{ u: number, setU: number => void }>*/ = ({ u, setU }) => {
  const client = useAPI();
  const [gameId, setGameId] = useURLParam('gameId');
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