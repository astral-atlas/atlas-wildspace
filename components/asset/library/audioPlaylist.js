// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { PlaylistClient } from "@astral-atlas/wildspace-client2";
import type { AudioPlaylist, GameID, AudioTrack } from "@astral-atlas/wildspace-models";

import type { LocalAsset } from "../../audio/track";
*/

import { AssetLibraryWindow } from "./window";
import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { v4 as uuid} from 'uuid';
import { AssetGrid, AssetGridItem } from "../grid";
import { PlaylistGrid } from "../../audio";
import { EditorForm, useSelection } from "../../editor";
import { EditorButton } from "../../editor/form";
import { OrderedListEditor } from "../../editor/list";
import { TrackAssetGrid, TrackAssetGridItem } from "../../audio/track";

/*::
export type AudioPlaylistLibraryProps = {
  gameId: GameID,
  playlist: { remove: PlaylistClient["remove"], update: PlaylistClient["update"], ... },

  tracksInGame: $ReadOnlyArray<AudioTrack>,
  playlistsInGame: $ReadOnlyArray<AudioPlaylist>,
  assetsInGame: LocalAsset[],
};
*/

const useTrackedKeys = /*:: <T>*/(
  keys/*: $ReadOnlyArray<T>*/,
  deps/*: mixed[]*/ = [],
)/*: { id: string, key: T }[]*/ => {
  const [trackedKeys, setTrackedKeys] = useState/*:: <{ id: string, key: T }[]>*/([]);
  useEffect(() => {
    setTrackedKeys(prev => {
      const next = [];
      for (const key of keys) {
        const prevItem = prev.find(item =>
          item.key === key &&
          !next.find(nextItem => nextItem.id === item.id));
        if (prevItem) {
          next.push(prevItem);
        } else {
          next.push({ id: uuid(), key })
        }
      }
      return next;
    })
  }, [keys, ...deps])
  return trackedKeys;
}

export const AudioPlaylistLibrary/*: Component<AudioPlaylistLibraryProps>*/ = ({
  gameId,
  playlist,
  playlistsInGame,
  assetsInGame,
  tracksInGame,
}) => {
  const [selected, select] = useSelection();
  const [mode, setMode] = useState/*:: <'browse' | 'pick_tracks'>*/('browse');

  const editingPlaylist = playlistsInGame.find(p => p.id === selected[0])
  const onDeleteSelected = async () => {
    if (!editingPlaylist)
      return;
    
    await playlist.remove(gameId, editingPlaylist.id)
  }

  const validTrackIds = useMemo(() => {
    if (!editingPlaylist)
      return [];

    return editingPlaylist.trackIds.filter(id => tracksInGame.find(t => t.id === id))
  }, [editingPlaylist, tracksInGame])
  
  const trackIdKeys = useTrackedKeys(validTrackIds)

  const EntryComponent = useMemo(() => {
    if (!editingPlaylist)
      return () => null;
    
    return ({ id }) => {
      const item = trackIdKeys.find(s => s.id === id);
      const track = item && tracksInGame.find(t => t.id === item.key)
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
  }, [trackIdKeys, tracksInGame, editingPlaylist])

  return h(AssetLibraryWindow, {
    editor: editingPlaylist && [
      h(EditorForm, {}, [
        h(EditorButton, { label: `Delete ${editingPlaylist.title}`, onButtonClick: onDeleteSelected }),
        mode === 'browse' && h(EditorButton, { label: `Add Tracks`, onButtonClick: () => setMode('pick_tracks') }),
        mode === 'pick_tracks' && h(EditorButton, { label: `Stop Adding Tracks`, onButtonClick: () => setMode('browse') }),
        h(OrderedListEditor, {
          itemsIds: trackIdKeys.map(s => s.id),
          onItemIdsChange: async (stagingIds) => {
            const trackIds = stagingIds
              .map(id => trackIdKeys.find(s => s.id == id))
              .filter(Boolean)
              .map(item => item.key);
            await playlist.update(gameId, editingPlaylist.id, { trackIds });
          },
          EntryComponent
        })
      ])
    ],
    content: [
      mode === 'browse' && [
        h('h3', {}, 'All Playlists'),
        h(PlaylistGrid, {
          playlists: playlistsInGame,
          assets: assetsInGame,
          tracks: tracksInGame,
          selected,
          select
        }),
      ],
      mode === 'pick_tracks' && !!editingPlaylist && [
        h('h3', {}, 'Tracks to Add'),
        h(TrackAssetGrid, {},
          tracksInGame.map(track => h(TrackAssetGridItem, {
            coverImageURL: assetsInGame.find(a => a.id === track.coverImageAssetId)?.url || null,
            onClick: async () => {
              const trackIds = [
                ...editingPlaylist.trackIds,
                track.id,
              ];
              await playlist.update(gameId, editingPlaylist.id, { trackIds });
              setMode('browse')
            },
            track,
          }))
        ),
      ]
    ],
  });
};
