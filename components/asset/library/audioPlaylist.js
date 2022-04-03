// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { PlaylistClient } from "@astral-atlas/wildspace-client2";
import type { AudioPlaylist, GameID, AudioTrack } from "@astral-atlas/wildspace-models";

import type { LocalAsset } from "../../audio/track";
*/

import { AssetLibraryWindow } from "./window";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { PlaylistGrid, TrackGrid } from "../../audio";
import {
  OrderedListEditor,
  EditorForm,
  useSelection,

  EditorButton,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextInput,
} from "../../editor";
import { useTrackedKeys } from "../../utils";

/*::
export type AudioPlaylistLibraryProps = {
  gameId: GameID,
  playlist: {
    remove: PlaylistClient["remove"],
    update: PlaylistClient["update"],
    create: PlaylistClient["create"],
    ...
  },

  tracksInGame: $ReadOnlyArray<AudioTrack>,
  playlistsInGame: $ReadOnlyArray<AudioPlaylist>,
  assetsInGame: LocalAsset[],
};
*/

export const AudioPlaylistLibrary/*: Component<AudioPlaylistLibraryProps>*/ = ({
  gameId,
  playlist,
  playlistsInGame,
  assetsInGame,
  tracksInGame,
}) => {
  const [selection, select] = useSelection();
  const [mode, setMode] = useState/*:: <'browse' | 'pick_tracks'>*/('browse');
  const editingPlaylist = playlistsInGame.find(p => p.id === selection[0])

  return h(AssetLibraryWindow, {
    editor: editingPlaylist && h(PlaylistEditor, {
      playlist, gameId,

      playlists: playlistsInGame,
      assets: assetsInGame,
      tracks: tracksInGame,

      mode, setMode,
      editingPlaylist,
    }),
    content: h(PlaylistBrowser, {
      playlist, gameId,

      playlists: playlistsInGame,
      assets: assetsInGame,
      tracks: tracksInGame,
      selection,
      select,
      mode,
      editingPlaylist,
    }),
  });
};

const PlaylistEditor = ({
  playlist, gameId,

  tracks,
  playlists,

  editingPlaylist,
  mode, setMode,
}) => {
  const validTrackIds = useMemo(() => {
    if (!editingPlaylist)
      return [];
    return editingPlaylist.trackIds
      .filter(id => tracks.find(t => t.id === id))
  }, [editingPlaylist, tracks])
  const trackIdKeys = useTrackedKeys(validTrackIds)

  const onDeleteSelected = async () => {
    if (!editingPlaylist)
      return;
    await playlist.remove(gameId, editingPlaylist.id)
  }
  const onPlaylistChange = async ({ title = null, trackIds = null }) => {
    await playlist.update(gameId, editingPlaylist.id, { title, trackIds })
  };
  const onItemIdsChange = async (stagingIds) => {
    const trackIds = stagingIds
      .map(id => trackIdKeys.find(s => s.id == id))
      .filter(Boolean)
      .map(item => item.key);
    await playlist.update(gameId, editingPlaylist.id, { trackIds });
  }

  const EntryComponent = useMemo(() => {
    if (!editingPlaylist)
      return () => null;
    
    return ({ id }) => {
      const item = trackIdKeys.find(s => s.id === id);
      const track = item && tracks.find(t => t.id === item.key)
      if (!track)
        return null;
      return [
        track.title,
        h(EditorButton, { label: 'Remove', onButtonClick: async () => {
          const trackIds = trackIdKeys
            .filter(item => item.id !== id)
            .map(item => item.key);
          await playlist.update(gameId, editingPlaylist.id, { trackIds });
        } })
      ]
    }
  }, [trackIdKeys, tracks, editingPlaylist])

  return h(EditorForm, {}, [
    h(EditorButton, {
      label: `Delete ${editingPlaylist.title}`,
      onButtonClick: onDeleteSelected
    }),
    h(EditorTextInput, {
      label: 'Title',
      text: editingPlaylist.title,
      onTextChange: title => onPlaylistChange({ title })
    }),
    mode === 'browse' && h(EditorButton, {
      label: `Add Tracks`,
      onButtonClick: () => setMode('pick_tracks')
    }),
    mode === 'pick_tracks' && h(EditorButton, {
      label: `Stop Adding Tracks`,
      onButtonClick: () => setMode('browse')
    }),
    h(OrderedListEditor, {
      itemsIds: trackIdKeys.map(s => s.id),
      onItemIdsChange,
      EntryComponent
    })
  ])
};

const PlaylistBrowser = ({
  playlist, gameId,
  playlists,
  assets,
  tracks,
  selection,
  select,
  mode,
  editingPlaylist
}) => {
  const onPickTrackClick = editingPlaylist && (async (track) => {
    const trackIds = [
      ...editingPlaylist.trackIds,
      track.id,
    ];
    await playlist.update(gameId, editingPlaylist.id, { trackIds });
  })
  const [stagingPlaylist, setStagingPlaylist] = useState({ title: '' })
  const onEditorSubmit = async () => {
    setStagingPlaylist({ title: '' });
    await playlist.create(gameId, stagingPlaylist.title, []);
  }

  return [
    h('div', { style: { borderBottom: '1px solid black' }}, [
      h(EditorForm, { onEditorSubmit }, [
        h(EditorHorizontalSection, {}, [
          h(EditorFormSubmit, {
            label: 'Add New Playlist'
          })
        ]),
        h(EditorHorizontalSection, {}, [
          h(EditorTextInput, {
            label: 'New Playlist Name',
            text: stagingPlaylist.title,
            onTextChange: title => setStagingPlaylist(p => ({ ...p, title })),
          }),
        ])
      ])
    ]),
    h('h3', {}, 'All Playlists'),
    h(PlaylistGrid, {
      playlists,
      assets,
      tracks,
      selection,
      select
    }),
    mode === 'pick_tracks' && !!editingPlaylist && [
      h('h3', {}, 'Tracks to Add'),
      h(TrackGrid, {
        tracks, assets,
        onTrackClick: onPickTrackClick
      }),
    ]
  ]
};