// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { AudioTrack, AudioPlaylist, Game } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
*/

import { LibraryAisle } from "../LibraryAisle";
import { h, useState } from "@lukekaalim/act";
import { LibraryShelf } from "../LibraryShelf";
import { LibraryFloorHeader } from "../LibraryFloor";
import { EditorForm } from "../../editor";
import {
  EditorButton,
  EditorHorizontalSection,
  EditorVerticalSection,
} from "../../editor/form";
import { useLibrarySelection } from "../librarySelection";

/*::

export type AudioPlaylistAisleProps = {
  client: WildspaceClient,
  game: Game,
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks: $ReadOnlyArray<AudioTrack>,
  assets: AssetDownloadURLMap,
};
*/

export const AudioPlaylistAisle/*: Component<AudioPlaylistAisleProps>*/ = ({ tracks, game, playlists, client }) => {
  const selection = useLibrarySelection()

  const selectedPlaylist = playlists.find(p => selection.selected.has(p.id))

  const onDeletePlaylist = async (playlist) => {
    await client.audio.playlist.remove(game.id, playlist.id);
  }

  return h(LibraryAisle, {
    floor: [
      h(LibraryFloorHeader, {
        title: "Playlists",
      }, [
        h(EditorForm, {}, [
          h(EditorHorizontalSection, {}, [
            h(EditorVerticalSection, {}, [
              h(EditorButton, { label: 'Create new Track' })
            ])
          ])
        ])
      ]),
      h(LibraryShelf, { title: 'Playlists', selection, books: playlists.map(playlist => ({
        id: playlist.id,
        title: playlist.title,
      })) })
    ],
    desk: [
      !!selectedPlaylist && h(EditorForm, {}, [
        h(EditorButton, { label: 'Delete', onButtonClick: () => onDeletePlaylist(selectedPlaylist) })
      ]),
    ]
  })
};
