// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { PlaylistClient } from "@astral-atlas/wildspace-client2";
import type { AudioPlaylist, GameID, AudioTrack } from "@astral-atlas/wildspace-models";

import type { LocalAsset } from "../../audio/track";
*/

import { AssetLibraryWindow } from "./window";
import { h } from "@lukekaalim/act";
import { AssetGrid, AssetGridItem } from "../grid";
import { PlaylistGrid } from "../../audio";
import { EditorForm, useSelection } from "../../editor";
import { EditorButton } from "../../editor/form";

/*::
export type AudioPlaylistLibraryProps = {
  gameId: GameID,
  playlist: { remove: PlaylistClient["remove"], ... },

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
  const [selected, select] = useSelection();

  const editingPlaylist = playlistsInGame.find(p => p.id === selected[0])
  const onDeleteSelected = async () => {
    if (!editingPlaylist)
      return;
    
    await playlist.remove(gameId, editingPlaylist.id)
  }

  return h(AssetLibraryWindow, {
    editor: editingPlaylist && [
      h(EditorForm, {}, [
        h(EditorButton, { label: `Delete ${editingPlaylist.title}`, onButtonClick: onDeleteSelected }),
        
      ])
    ],
    content: [
      h('h3', {}, 'All Playlists'),
      h(PlaylistGrid, {
        playlists: playlistsInGame,
        assets: assetsInGame,
        tracks: tracksInGame,
        selected,
        select
      })
    ]
  });
};