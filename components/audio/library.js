// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*::
import type { 
  AudioTrack, AudioPlaylist, AudioPlaylistState,
  GameID, AssetDescription, AudioPlaylistID, AssetID
} from '@astral-atlas/wildspace-models';
*/
import { h, useContext, useMemo, useEffect, useRef, useState } from '@lukekaalim/act';
import throttle from 'lodash.throttle';
import styles from './index.module.css';
import { TrackInfo } from "./track";

const AudioLibraryModeInput = ({ mode, onModeChange }) => {
  return [
    h('button', { disabled: mode === 'playlist', onClick: e => onModeChange('playlist') }, 'Playlists'),
    h('button', { disabled: mode === 'track', onClick: e => onModeChange('track') }, 'Tracks'),
  ]
}

export const AudioLibrary = ({ selection = {}, onSelect, tracks, playlists, assets }) => {
  const [mode, setMode] = useState('playlist')

  const onSelectPlaylists = (selectedPlaylists, event) => {
    const nextPlaylists = event.shiftKey ? [...selection.playlists, ...selectedPlaylists] : selectedPlaylists;
    onSelect({ playlists: [...new Set(nextPlaylists)], tracks: [] })
  };
  const onSelectTracks = (selectedTracks, event) => {
    const nextTracks = event.shiftKey ? [...selection.tracks, ...selectedTracks] : selectedTracks;
    onSelect({ playlists: [], tracks: [...new Set(nextTracks)] })
  }

  return [
    h(AudioLibraryModeInput, { mode, onModeChange: newMode => setMode(newMode) }),
    (() => {
      switch (mode) {
        case 'playlist':
          return h(PlaylistLibrary, { playlists, tracks, assets, onSelect: onSelectPlaylists, selection: selection.playlists })
        case 'track':
          return h(TracksLibrary, { tracks, assets, onSelect: onSelectTracks, selection: selection.tracks })
        default:
          return 'oops';
      }
    })()
  ]
}

export const TracksLibrary = ({ tracks, assets, selection = [], onSelect }) => {
  const onListClick = e => {
    if (e.target !== e.currentTarget)
      return;
    onSelect([], e);
  };
  const [filter, setFilter] = useState('');

  const filteredTracks = useMemo(() => tracks.filter(track => {
    if (!filter)
      return true;

    if (track.title.toLowerCase().includes(filter.toLowerCase()))
      return true;
    if (track.artist.toLowerCase().includes(filter.toLowerCase()))
      return true;
  }), [filter, tracks]);

  return h('div', { class: styles.trackLibrary }, [
    tracks.length === 0 && h('div', { class: styles.playlistLibraryNotice }, 'No Tracks'),
    tracks.length > 0 && [
      h('label', { class: styles.librarySearchLabel }, [
        h('span', {}, 'Search Tracks'),
        h('input', { type: 'text', value: filter, onInput: e => setFilter(e.target.value) }),
      ]),
      h('ul', {  class: styles.trackLibraryList, onClick: onListClick }, [
        filteredTracks.map(track => {
          const coverAsset = assets.find(a => a.id === track.coverImageAssetId)
          const isSelected = selection.includes(track.id);
    
          return h('li', {
            class: [styles.trackItem, isSelected && styles.trackItemSelected].filter(Boolean).join(' '),
            onClick: e => onSelect([track.id], e)
          }, h(TrackInfo, { track, coverImage: coverAsset && coverAsset.url }));
        })
      ])
    ]
  ]);
};

export const PlaylistLibrary = ({ playlists, tracks, assets, selection = [], onSelect }) => {
  const onListClick = e => {
    if (e.target !== e.currentTarget)
      return;
    onSelect([], e);
  };
  const [filter, setFilter] = useState('');

  const filteredPlaylists = useMemo(() => playlists.filter(playlist => {
    if (!filter)
      return true;

    if (playlist.title.toLowerCase().includes(filter.toLowerCase()))
      return true;
  }), [filter, playlists])

  return h('div', { class: styles.playlistLibrary }, [
    playlists.length === 0 && h('div', { class: styles.playlistLibraryNotice }, 'No Playlists'),
    playlists.length > 0 && [
      h('label', { class: styles.librarySearchLabel }, [
        h('span', {}, 'Search Playlists'),
        h('input', { type: 'text', value: filter, onInput: e => setFilter(e.target.value) }),
      ]),
      h('ul', {  class: styles.playlistLibraryList, onClick: onListClick }, [
        filteredPlaylists.map(playlist => {
          const firstTrackId = playlist.trackIds[0];
          const firstTrack = firstTrackId && tracks.find(t => t.id === firstTrackId);
          const coverAsset = firstTrack && assets.find(a => a.id === firstTrack.coverImageAssetId)
          const isSelected = selection.includes(playlist.id);
          return [
            h('li', {
              class: [styles.playlistItem, isSelected && styles.playlistItemSelected].filter(Boolean).join(' '),
              onClick: throttle(e => (onSelect([playlist.id], e)), 300)
            }, [
              h(PlaylistInfo, { playlist, coverImageURL: coverAsset && coverAsset.url })
            ])
          ]
        })
      ])
    ]
  ]);
};

export const PlaylistInfo = ({ playlist, tracks, assets, coverImageURL }) => {
  return h('div', { class: styles.playlistInfo }, [
    coverImageURL && h('img', { src: coverImageURL.href }),
    h('p', {}, playlist.title)
  ])
}