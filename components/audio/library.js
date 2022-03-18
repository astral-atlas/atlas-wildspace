// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*::
import type { 
  AudioTrack, AudioPlaylist, AudioPlaylistState,
  GameID, AssetDescription, AudioPlaylistID, AssetID,
  AudioTrackID,
} from '@astral-atlas/wildspace-models';
import type { StagingTrack } from "./track";
*/
import { h, useContext, useMemo, useEffect, useRef, useState } from '@lukekaalim/act';
import throttle from 'lodash.throttle';
import styles from './index.module.css';
import { TrackAssetGrid, TrackAssetGridItem, TrackInfo } from "./track";
import { PlaylistInfo } from "./playlist";
import { AssetGrid, AssetGridItem } from '../asset';
import { UploadTrackControls, UploadTrackInput, useLocalTrackData } from "./upload";

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
}
*/

export const AudioAssetLibrary/*: Component<AudioAssetLibraryProps>*/ = ({
  tracks,
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
        h(TracksLibrary, { tracks, assets: [], selection, onSelect, upload })
      ];
    case 'playlist':
      return [
        h(ModeInput, { modes: ['track', 'playlist'], mode, onChange: setMode }),
        h(PlaylistLibrary, { tracks, playlists: [], assets: [], selection, onSelect })
      ];
  }
}

export const AudioLibrary/*: Component<AudioLibraryProps>*/ = ({ selection, onSelect, tracks, playlists, assets }) => {
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

/*::
export type TracksLibraryMode = 'edit' | 'upload';
export type TracksLibraryProps = {
  selection: AudioAssetLibrarySelection,
  onSelect: (selection: AudioAssetLibrarySelection, event: MouseEvent) => mixed,
  tracks: AudioTrack[],
  assets: { id: AssetID, url: URL }[],
}
*/

export const TracksLibrary/*: Component<TracksLibraryProps>*/ = ({
  tracks,
  assets, selection, onSelect,
  upload
}) => {
  const [mode, setMode] = useState('edit');
  const [stagingTracks, setStagingTracks] = useState([]);
  const stagingTrackData = useLocalTrackData(stagingTracks);

  // ALL
  const onTrackSelect = (trackIds) => {
    onSelect({
      ...selection,
      tracks: trackIds
    });
  }

  // STAGING
  const onStagingTracksSubmit = (tracks, playlistName) => {
    setStagingTracks([]);
    upload(stagingTracks);
  };
  const onStagingTrackSelect = (trackIds) => {
    const indices = trackIds.map(id => stagingTrackData.findIndex(data => data.track.id === id))
    onSelect({
      ...selection,
      stagingTrackIndices: indices,
    });
  }
  const onStagingTracksAdd = (nextStagingTracks) => {
    setStagingTracks([...stagingTracks, ...nextStagingTracks]);
  };
  const onSubmitStagingTracks = () => {
    setStagingTracks([]);
    upload(stagingTracks);
  }

  console.log(tracks)

  return h('div', { style: { display: 'flex', flexDirection: 'row', border: '1px solid black' } }, [
    h('div', { style: { flexGrow: 2, flexBasis: '0px' } }, [
      h('h3', {}, 'All Tracks'),
      h(TrackAssetGrid, {
        assets, tracks,
        onSelect: onTrackSelect,
        selected: selection.tracks
      }),
      h('hr'),
      h('h3', {}, 'Upload Tracks Tracks'),
      h(UploadTrackControls, {
        stagedTrackCount: stagingTracks.length,
        onStagingTracksAdd,
        onSubmitStagingTracks
      }),
      h(TrackAssetGrid, {
        assets: stagingTrackData
          .map(data => [data.audioAsset, data.imageAsset])
          .flat()
          .filter(Boolean),
        tracks: stagingTrackData
          .map(data => data.track),
        onSelect: onStagingTrackSelect,
        selected: selection.stagingTrackIndices.map(i => stagingTrackData[i].track.id)
      }),
    ]),
    selection.stagingTrackIndices.length > 0 &&
      h('div', { classList: [styles.trackEditorPane] }, ['Editor'])
  ]);

  switch (mode) {
    case 'edit':
      return h('div', { class: styles.trackLibrary }, [
        h(ModeInput, { modes: ['edit', 'upload'], mode, onChange: setMode }),
        h(TrackLibraryAssets, { tracks, assets, selection })
      ]);
    case 'upload':
      return h('div', { class: styles.trackLibrary }, [
        h(ModeInput, { modes: ['edit', 'upload'], mode, onChange: setMode }),
        h(UploadTrackInput, { stagingTracks, onStagingTracksChange: setStagingTracks, onStagingTracksSubmit }),
      ]);
    default:
      throw new Error();
  }
};

export const TrackLibraryAssets = ({ tracks, assets, selection }) => {
  const [filter, setFilter] = useState('');

  const filteredTracks = useMemo(() => tracks.filter(track => {
    if (!filter)
      return true;

    if (track.title.toLowerCase().includes(filter.toLowerCase()))
      return true;
    if (track.artist && track.artist.toLowerCase().includes(filter.toLowerCase()))
      return true;
  }), [filter, tracks]);

  if (tracks.length === 0)
    return h('div', { class: styles.playlistLibraryNotice }, 'No Tracks');

  return (
    h(AssetGrid, {}, [
      filteredTracks.map(track => {
        const coverAsset = assets.find(a => a.id === track.coverImageAssetId)
        const isSelected = selection.tracks.includes(track.id);
        return h(AssetGridItem, {},
          h('div', {
            classList: [styles.trackItem, isSelected && styles.trackItemSelected],
            //onClick: e => onSelect({ ...selection, tracks: [...selection.tracks, track.id] }, e)
          },
          h(TrackInfo, { track, coverImage: coverAsset && coverAsset.url })));
      })
    ])
  )
}

/*::
export type PlaylistLibraryProps = {
  selection: AudioAssetLibrarySelection,
  onSelect: (selection: AudioAssetLibrarySelection, event: MouseEvent) => mixed,
  tracks: AudioTrack[],
  playlists: AudioPlaylist[],
  assets: { id: AssetID, url: URL }[],
}
*/

export const PlaylistLibrary/*: Component<PlaylistLibraryProps>*/ = ({ playlists, tracks, assets, selection, onSelect }) => {
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
              h(PlaylistInfo, { playlist, coverImageURL: coverAsset ? coverAsset.url : null, tracks })
            ])
          ]
        })
      ])
    ]
  ]);
};
