// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { AudioTrack, Game } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { StagingTrack } from "../../audio/track";
*/

import { h, useEffect, useState } from "@lukekaalim/act";
import parseAudioMetadata from 'parse-audio-metadata';
import { v4 as uuid } from 'uuid';

import { LibraryShelf } from "../LibraryShelf";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloorHeader } from "../LibraryFloor";
import { EditorForm } from "../../editor";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorHorizontalSection,
  EditorTextInput,
  EditorVerticalSection,
  FilesButtonEditor,
  FilesEditor,
  SelectEditor,
} from "../../editor/form";
import { useLibrarySelection } from "../librarySelection";
import { TextInput } from "../../preview/inputs";

/*::

export type AudioTrackAisleProps = {
  game: Game,

  tracks: $ReadOnlyArray<AudioTrack>,
  client: WildspaceClient,
  assets: AssetDownloadURLMap,
};
*/

export const AudioTrackAisle/*: Component<AudioTrackAisleProps>*/ = ({
  tracks,
  client,
  game,
  assets,
}) => {
  const selection = useLibrarySelection()

  const [stagingTracks, setStagingTracks] = useState/*:: <StagingTrack[]>*/([]);
  const [isStagingPlaylist, setIsStagingPlaylist] = useState(false);
  const [stagingPlaylistTitle, setStagingPlaylistTitle] = useState('');
  const [stagingPlaylistArtwork, setStagingPlaylistArtwork] = useState(null);

  const selectedTrack = tracks.find(t => selection.selected.has(t.id))

  const [stagingPlaylistArtworkURL, setStagingPlaylistArtworkURL] = useState(null);
  useEffect(() => {
    if (!stagingPlaylistArtwork) {
      setStagingPlaylistArtworkURL(null);
      return;
    }
    const url = URL.createObjectURL(stagingPlaylistArtwork);
    setStagingPlaylistArtworkURL(url);
    return () => {
      URL.revokeObjectURL(url);
    }
  }, [stagingPlaylistArtwork])

  const onTrackFilesSelect = async (files) => {
    const nextStagingTracks = await Promise.all(files.map(async file => {
      const { title, album, artist, duration } = await parseAudioMetadata(file);
      return {
        id: uuid(),
        audioFile: file,
        imageFile: null,

        title,
        album,
        artist,

        trackLengthMs: duration * 10000,
      };
    }))
    const trackAlbumName = nextStagingTracks.map(t => t.album).find(Boolean);
    if (trackAlbumName) {
      setStagingPlaylistTitle(trackAlbumName)
      setIsStagingPlaylist(true);
    }
    setStagingTracks(stagingTracks => [
      ...stagingTracks,
      ...nextStagingTracks,
    ]);
  }
  const onStagingPlaylistArtworkFileSelect = ([file]) => {
    setStagingPlaylistArtwork(file);
  }
  const onStartStagingUpload = async () => {
    setStagingTracks([]);
    setIsStagingPlaylist(false);
    const nextTracks = await Promise.all(stagingTracks.map(async stagingTrack => {
      const { artist, audioFile, title, trackLengthMs } = stagingTrack;
      return await client.audio.tracks.create(
        game.id, title, artist, audioFile.type,
        trackLengthMs,
        new Uint8Array(await audioFile.arrayBuffer())
      )
    }))
    if (isStagingPlaylist) {
      await client.audio.playlist.create(game.id, stagingPlaylistTitle, nextTracks.map(t => t.track.id))
    }
  }
  const onTrackDeleteClick = async (track) => {
    await client.audio.tracks.remove(game.id, track.id);
  }

  const [page, setPage] = useState(0);
  const tracksPerPage = 32;
  const pageCount = Math.ceil(tracks.length / tracksPerPage);
  const tracksInPage = tracks.slice(page * tracksPerPage, (page + 1) * tracksPerPage);

  const selectedTrackAsset = selectedTrack && assets.get(selectedTrack.trackAudioAssetId);

  return h(LibraryAisle, {
    floor: [
      h(LibraryFloorHeader, {
        title: "Tracks",
      }, [
        h(EditorForm, {}, [
          h(FilesButtonEditor, {
            label: 'Select Tracks to Upload',
            onFilesChange: onTrackFilesSelect,
            multiple: true,
            accept: 'audio/*'
          }),
          pageCount > 1 && [
            h(SelectEditor, {
              label: 'page',
              selected: page.toString(),
              values: Array.from({ length: pageCount }).map((_, i) => ({ value: i.toString() })),
              onSelectedChange: pageString => setPage(parseInt(pageString, 10))
            })
          ],
        ]),
      ]),
      stagingTracks.length > 0 &&  [
        h(LibraryShelf, { title: 'Tracks to Upload', selection, books: stagingTracks.map(track => ({
          id: track.id,
          title: track.title,
        })) }),
        h(EditorForm, {}, [
          h(EditorButton, {
            label: 'Start Upload',
            onButtonClick: onStartStagingUpload
          }),
          h(EditorCheckboxInput, {
            label: 'Upload as Playlist',
            checked: isStagingPlaylist,
            onCheckedChange: setIsStagingPlaylist
          }),
          isStagingPlaylist && [
            h(EditorTextInput, {
              label: 'Playlist Name',
              text: stagingPlaylistTitle,
              onTextChange: setStagingPlaylistTitle,
            }),
            h(FilesEditor, {
              label: 'Playlist Artwork',
              accept: 'image/*',
              onFilesChange: onStagingPlaylistArtworkFileSelect
            }),
            stagingPlaylistArtworkURL && h('img', { style: { width: '256px' }, src: stagingPlaylistArtworkURL })
          ]
        ])
      ],
      h(LibraryShelf, { selection, title: 'Tracks', books: tracksInPage.map(track => ({
        id: track.id,
        title: track.title,
      })) })
    ],
    desk: [
      !!selectedTrack && h(EditorForm, {}, [
        h(EditorButton, { label: 'Delete', onButtonClick: () => onTrackDeleteClick(selectedTrack) }),
        h(EditorTextInput, { label: 'ID', text: selectedTrack.id }),
        h(EditorTextInput, { label: 'AssetID', text: selectedTrack.trackAudioAssetId}),
        !!selectedTrackAsset && h(EditorTextInput, { label: 'AssetType', text: selectedTrackAsset.description.MIMEType }),
        !!selectedTrackAsset && h('audio', { src: selectedTrackAsset.downloadURL, controls: true })
      ]),
    ]
  })
};
