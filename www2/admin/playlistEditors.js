// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { clientContext, useAsync } from './hooks.js';

import styles from './index.module.css';

const TrackListEditor = ({ u, game, trackIds, onChange }) => {
  const client = useContext(clientContext);
  const [tracks] = useAsync(() => client.audio.tracks.list(game.id), [client, u, game.id])

  if (!tracks)
    return null;

  const onSelectNewTrack = (e) => {
    onChange([...trackIds, e.target.value])
    e.target[0].selected = true;
  };
  const onUpdateExistingTrack = (index) => (e) => {
    onChange(trackIds.map((t, i) => i === index ? e.target.value : t));
  };
  const onRemoveExistingTrack = (index) => () => {
    onChange(trackIds.filter((t, i) => i !== index));
  }

  return [
    h('section', { style: { display: 'flex', flexDirection: 'column' } }, [
      h('section', {}, [
        h('select', { onChange: onSelectNewTrack }, [
          h('option', { value: '', selected: true }, '<None>'),
          ...tracks.map(track => h('option', { value: track.id }, track.title)),
        ]),
        h('hr'),
      ]),
      ...trackIds.map((trackId, i) =>
        h('label', { class: styles.playlistEditorRow }, [
          h('p', {}, `#${i}`),
          h('select', { onChange: onUpdateExistingTrack(i) },
            tracks.map(track =>
              h('option', { value: track.id, selected: track.id === trackId }, track.title))),
          h('button', { onClick: onRemoveExistingTrack(i) }, 'Delete')
        ]))
    ])
  ];
};

const NewPlaylistEditor = ({ game, onCreate, u }) => {
  const client = useContext(clientContext);
  const [newPlaylist, setNewPlaylist] = useState({ title: '', trackIds: [] })

  const onSubmit = async (e) => {
    e.preventDefault();
    onCreate(await client.audio.playlist.create(game.id, newPlaylist.title, newPlaylist.trackIds));
  }

  return [
    h('form', { class: styles.simpleEditorForm, onSubmit }, [
      h('label', {}, ['Title',
        h('input', { type: 'text', onChange: e => setNewPlaylist(v => ({ ...v, title: e.target.value })), value: newPlaylist.title })]),
      h('p', {}, ['Playlist Tracks',
        h(TrackListEditor, {
          game, u,
          trackIds: newPlaylist.trackIds,
          onChange: trackIds => setNewPlaylist(v => ({ ...v, trackIds }))
        }
      )]),
      h('input', { type: 'submit', value: 'Add New Playlist' }),
    ])
  ]
};

const ExistingPlaylistEditor = ({ game, playlistId, u, onGameUpdate }) => {
  const client = useContext(clientContext);
  const [playlist] = useAsync(() => client.audio.playlist.read(game.id, playlistId), [client, u, game.id, playlistId])

  if (!playlist)
    return null;
  
  const onSubmit = async (e) => {
    e.preventDefault();
  }

  const updatePlaylist = async (newPlaylist) => {
    await client.audio.playlist.update(game.id, playlistId, newPlaylist)
    onGameUpdate();
  };
  const onClickDelete = async (e) => {
    e.preventDefault();
    await client.audio.playlist.remove(game.id, playlistId)
    onGameUpdate();
  }

  return [
    h('form', { class: styles.simpleEditorForm, onSubmit }, [
      h('label', {}, ['Title',
        h('input', { type: 'text', onChange: e => updatePlaylist(({ title: e.target.value })), value: playlist.title })]),
      h('p', {}, ['Playlist Tracks',
        h(TrackListEditor, {
          game, u,
          trackIds: playlist.trackIds,
          onChange: trackIds => updatePlaylist(({ trackIds }))
        }
      )]),
      h('button', { onClick: onClickDelete }, 'Delete Playlist')
    ])
  ]
};

export const PlaylistEditor/*: Component<{ u: number, game: Game, onGameUpdate: () => mixed }>*/ = ({ u, game, onGameUpdate }) => {
  const client = useContext(clientContext);
  const [playlistId, setPlaylistId] = useState(null);
  const [playlists] = useAsync(() => client.audio.playlist.list(game.id), [client, u, game.id])

  if (!playlists)
    return null;

  const onCreate = (playlist) => {
    setPlaylistId(playlist.id);
    onGameUpdate()
  };

  return [
    h('h3', {}, 'Playlist Editor'),
    h('div', {}, [
      h('button', { onClick: () => setPlaylistId(null), disabled: playlistId === null }, 'Create New Playlist'),
      ...playlists.map(playlist => h('button', { onClick: () => setPlaylistId(playlist.id), disabled: playlistId === playlist.id }, `Edit ${playlist.title}`))
    ]),
    playlistId === null && h(NewPlaylistEditor, { game, onCreate, u }),
    playlistId !== null && h(ExistingPlaylistEditor, { game, playlistId, u, onGameUpdate })
  ];
};