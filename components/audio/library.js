// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*::
import type { 
  AudioTrack, AudioPlaylist, AudioPlaylistState,
  GameID, AssetDescription, AudioPlaylistID, AssetID,
  AudioTrackID,
} from '@astral-atlas/wildspace-models';
import type { LocalAsset, StagingTrack } from "./track";
import type { TrackData } from "./player";
import type { LocalTrackData } from "./upload";
*/
import { h, useContext, useMemo, useEffect, useRef, useState } from '@lukekaalim/act';
import throttle from 'lodash.throttle';
import styles from './index.module.css';
import { TrackAssetGrid, TrackAssetGridItem, TrackInfo } from "./track";
import { PlaylistInfo } from "./playlist";
import { AssetGrid, AssetGridItem, TracksLibrary } from '../asset';
import { EditorForm, EditorFormSubmit, EditorTextInput, FilesEditor, useSelection } from '../editor';
import { SelectEditor } from "../editor/form";

/*::
export type LibraryMode = 'playlist' | 'track' | 'upload';
*/

const ModeInput = ({ modes, mode, onChange }) => {
  return h('div', {},
    modes.map(m => 
      h('button', { disabled: mode === m, onClick: e => onChange(m) }, m))
  );
}
/*::
export type AudioLibrarySelection = {
  tracks: AudioTrackID[],
  playlists: AudioPlaylistID[]
}

export type AudioLibraryProps = {
  tracks: AudioTrack[],
  playlists: AudioPlaylist[],
  assets: { id: AssetID, url: URL }[],

  onTrackUpdate: () => {},
}
*/

/*::
export type AudioAssetLibraryMode =
  | 'track'
  | 'playlist'
export type AudioAssetLibraryModeInputProps = {
  onChange: AudioAssetLibraryMode => mixed,
  mode: AudioAssetLibraryMode,
};
*/

/*::
export type AudioAssetLibrarySelection = {
  stagingTrackIndices: number[],
  tracks: AudioTrackID[],
  playlists: AudioPlaylistID[],
};
export type AudioAssetLibraryProps = {
  tracks: AudioTrack[],
  assets: LocalAsset[],
  upload: (stagingTracks: StagingTrack[]) => void, 
}
*/

const AudioAssetLibrary/*: Component<AudioAssetLibraryProps>*/ = ({
  tracks,
  assets,
  upload,
}) => {
  const [mode, setMode] = useState('track');
  const [selection, setSelection] = useState({
    tracks: [], playlists: [], stagingTrackIndices: []
  });

  const onSelect = (nextSelection) => {
    setSelection(nextSelection);
  }

  switch (mode) {
    case 'track':
      return [
        h(ModeInput, { modes: ['track', 'playlist'], mode, onChange: setMode }),
        //h(TracksLibrary, { tracks, assets, selection, onSelect, upload })
      ];
    case 'playlist':
      return [
        h(ModeInput, { modes: ['track', 'playlist'], mode, onChange: setMode }),
        h(PlaylistLibrary, { tracks, playlists: [], assets: [], selection, onSelect })
      ];
  }
}

/*::
export type TracksLibraryMode = 'edit' | 'upload';
export type TracksLibraryProps = {
  selection: AudioAssetLibrarySelection,
  tracks: AudioTrack[],
  upload: StagingTrack[] => mixed,
  assets: LocalAsset[],
}
*/

/*::
export type PlaylistLibraryProps = {
  onSelect: (selection: AudioAssetLibrarySelection, event: MouseEvent) => mixed,
  tracks: AudioTrack[],
  playlists: AudioPlaylist[],
  assets: { id: AssetID, url: URL }[],
}
*/

export const PlaylistLibrary/*: Component<PlaylistLibraryProps>*/ = ({ playlists, tracks, assets }) => {
  const onListClick = e => {
    if (e.target !== e.currentTarget)
      return;
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
          const isSelected = false;//selection.includes(playlist.id);
          return [
            h('li', {
              class: [styles.playlistItem, isSelected && styles.playlistItemSelected].filter(Boolean).join(' '),
            }, [
              h(PlaylistInfo, { playlist, coverImageURL: coverAsset ? coverAsset.url : null, tracks })
            ])
          ]
        })
      ])
    ]
  ]);
};
