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
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { EditorForm, OrderedListEditor } from "../../editor";
import {
  EditorButton,
  EditorHorizontalSection,
  EditorTextInput,
  EditorVerticalSection,
  SelectEditor,
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

  const selectedPlaylist = playlists.find(p => selection.selected.has(p.id));
  const [selectedStagingTrack, setSelectedStagingTrack] = useState(null);

  const onDeletePlaylist = async (playlist) => {
    await client.audio.playlist.remove(game.id, playlist.id);
  }
  const onPlaylistUpdate = async (playlist, playlistProps) => {
    await client.audio.playlist.update(game.id, playlist.id, playlistProps);
  }
  const onItemIdsChange = (ids) => {
    console.log('ho!')
  }
  const onCreatePlaylistClick = async () => {
    await client.audio.playlist.create(game.id, '', []);
  }

  return h(LibraryAisle, {
    floor: h(LibraryFloor, {}, [
      h(LibraryFloorHeader, {
        title: "Playlists",
      }, [
        h(EditorForm, {}, [
          h(EditorHorizontalSection, {}, [
            h(EditorVerticalSection, {}, [
              h(EditorButton, { label: 'Create new Playlist', onButtonClick: onCreatePlaylistClick })
            ])
          ])
        ])
      ]),
      h(LibraryShelf, { title: 'Playlists', selection, books: playlists.map(playlist => ({
        id: playlist.id,
        title: playlist.title,
      })) })
    ]),
    desk: [
      !!selectedPlaylist && h(EditorForm, {}, [
        h(EditorButton, { label: 'Delete', onButtonClick: () => onDeletePlaylist(selectedPlaylist) }),

        h(EditorTextInput, {
          label: 'Playlist Name',
          text: selectedPlaylist.title,
          onTextChange: title => onPlaylistUpdate(selectedPlaylist, { title }),
        }),
        h(SelectEditor, {
          label: "Track to Add",
          values: [...tracks.map(t => ({ title: t.title, value: t.id })),
            { title: 'N/A', value: '' }
          ],
          selected: selectedStagingTrack || '',
          onSelectedChange: setSelectedStagingTrack,
        }),
        !!selectedStagingTrack && h(EditorButton, {
          label: 'Add Track',
          onButtonClick: () => onPlaylistUpdate(selectedPlaylist, { trackIds: [
            ...selectedPlaylist.trackIds,
            selectedStagingTrack,
          ]})
        }),
        
        h(OrderedListEditor, {
          itemsIds: selectedPlaylist.trackIds,
          EntryComponent: TrackItem,
          onItemIdsChange: trackIds => onPlaylistUpdate(selectedPlaylist, { trackIds }),
        })
      ]),
    ]
  })
};
const TrackItem = ({ id }) => {
  return id;
}
