// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*::
import type { 
  AudioTrack, AudioPlaylist, AudioPlaylistState,
  GameID, AssetDescription, AudioPlaylistID, AssetID,
  AudioTrackID,
} from '@astral-atlas/wildspace-models';
import type { 
  AssetClient, TrackClient, PlaylistClient,
} from '@astral-atlas/wildspace-client2';
import type { LocalAsset, StagingTrack } from "../../audio/track";
import type { LocalTrackData } from "../../audio/upload";
*/

import { h, useMemo, useState } from '@lukekaalim/act';
import styles from './audioTrack.module.css';

import { v4 as uuid } from 'uuid';
import mimeLib from 'mime/lite';
import parseAudioMetadata from 'parse-audio-metadata';

import { TrackAssetGrid, TrackAssetGridItem } from "../../audio/track";
import { useLocalTrackData } from "../../audio/upload";
import {
  EditorForm, EditorFormSubmit,
  EditorTextInput, FilesEditor,
  useSelection, SelectEditor, EditorHorizontalSection, EditorButton, FilesButtonEditor, EditorCheckboxInput
} from '../../editor';
import { useAsync } from '../../utils/async';
import { useTaskQueue } from '../../loading/tasks';

/*::
export type TracksLibraryProps = {
  gameId: GameID,
  tracksInGame: $ReadOnlyArray<AudioTrack>,
  assetsInGame: LocalAsset[],

  trackClient: { create: TrackClient['create'], remove: TrackClient['remove'], ... },
  playlistClient: { create: PlaylistClient['create'], ... },
}
*/

const getTrackCoverImageAssetURL = (track, assets) => {
  const id = track.coverImageAssetId;
  if (!id)
    return;
  const asset = assets.find(asset => asset.id === id);
  if (!asset)
    return;
  return asset.url;
}

export const TracksLibrary/*: Component<TracksLibraryProps>*/ = ({
  gameId,
  tracksInGame, assetsInGame,
  trackClient, playlistClient
}) => {
  const [stagingTracks, setStagingTracks] = useState([]);
  const [selectedTrackIds, { add, remove, replace }] = useSelection()

  const uploadQueue = useTaskQueue(async stagingTrack => {
    const { title, artist, audioFile, imageFile, trackLengthMs } = stagingTrack;
    const cover = imageFile && {
      data: new Uint8Array(await imageFile.arrayBuffer()),
      mime: imageFile.type
    };
    const track = await trackClient.create(
      gameId, title, artist,
      audioFile.type || mimeLib.getType(audioFile.name) || 'application/octet-stream',
      trackLengthMs,
      new Uint8Array(await audioFile.arrayBuffer()),
      { cover }
    )
    return track;
  }, 4)
  const removeQueue = useTaskQueue(async track => {
    return await trackClient.remove(gameId, track.id);
  })
  const validStagingTracks = useMemo(
    () => stagingTracks
      .filter(s => !uploadQueue.completed.find(c => c.target.id === s.id)),
    [stagingTracks, uploadQueue.completed]
  )
  const validSelectedTrackIds = useMemo(
    () => selectedTrackIds.filter(id =>
      !uploadQueue.orders.find(o => o.targets.find(t => t.id === id)) &&
      !removeQueue.orders.find(o => o.targets.find(t => t.id === id))
    ),
    [uploadQueue.orders, selectedTrackIds]
  )
  const stagingTrackData = useLocalTrackData(validStagingTracks);
  const assets = [
    ...assetsInGame,
    ...stagingTrackData.map(data => data.imageAsset),
    ...stagingTrackData.map(data => data.audioAsset),
  ].filter(Boolean);
  
  const onStagingTracksAdd = (nextStagingTracks) => {
    setStagingTracks([...stagingTracks, ...nextStagingTracks]);
  };
  const onStagingTracksChange = (nextStagingTracks) => {
    setStagingTracks(nextStagingTracks);
  }
  const onSubmitStagingTracks = async (playlistName) => {
    const trackData = await uploadQueue.addTasks(validStagingTracks);
    setStagingTracks([]);
    if (playlistName)
      await playlistClient.create(gameId, playlistName, trackData.map(d => d.track.id))
  }
  const onTrackClick = (track, selected) => (event) => {
    if (!event.shiftKey)
      return replace([track.id]);
    if (selected)
      return remove([track.id]);
    return add([track.id]);
  }
  const onTrackDblCLick = (allTrackIds) => (event) => {
    if (event.shiftKey)
      return;
    add(allTrackIds);
  };
  const onTracksDelete = async (tracks) => {
    await removeQueue.addTasks(tracks);
  }

  return h('div', { style: { display: 'flex', flexDirection: 'row', border: '1px solid black', overflow: 'hidden', flexGrow: 1 } }, [
    h('div', { style: { flexGrow: 2, flexBasis: '0px', overflow: 'auto', display: 'flex', flexDirection: 'column' } }, [
      h(UploadTrackControls, {
        stagedTrackCount: validStagingTracks.length,
        onStagingTracksAdd,
        onSubmitStagingTracks
      }),
        validStagingTracks.length > 0 && [
        h('hr', { style: { width: '100%', borderTop: 0, boxSizing: 'border-box' }}),
        h('h3', {}, 'Tracks to Upload'),
        h(TrackAssetGrid, { onClick: e => e.currentTarget === e.target && replace([]) },
          stagingTrackData.map(data => h(TrackAssetGridItem, {
            onClick: onTrackClick(data.track, validSelectedTrackIds.includes(data.track.id)),
            onDblClick: onTrackDblCLick(stagingTrackData.map(d => d.track.id)),
            disabled: !!uploadQueue.orders.find(o => o.targets.find(t => t.id === data.track.id)),
            loading: !!uploadQueue.inflights.find(t => t.id === data.track.id),
            selected: validSelectedTrackIds.includes(data.track.id),
            coverImageURL: getTrackCoverImageAssetURL(data.track, assets),
            track: data.track,
          }))
        ),
      ],
      tracksInGame.length > 0 && [
        h('hr', { style: { width: '100%', borderTop: 0, boxSizing: 'border-box' }}),
        h('h3', {}, 'All Tracks'),
        h(TrackAssetGrid, { onClick: e => e.currentTarget === e.target && replace([]) },
          tracksInGame.map(track => h(TrackAssetGridItem, {
            onClick: onTrackClick(track, validSelectedTrackIds.includes(track.id)),
            onDblClick: onTrackDblCLick(tracksInGame.map(t => t.id)),
            disabled: !!removeQueue.orders.find(o => o.targets.find(t => t.id === track.id)),
            selected: validSelectedTrackIds.includes(track.id),
            coverImageURL: getTrackCoverImageAssetURL(track, assets),
            track,
          }))
        ),
      ]
    ]),
    h('div', { classList: [styles.trackEditorPane] },
      h(TracksLibraryEditor, {
        assets,
        tracks: tracksInGame,
        stagingTrackData,
        stagingTracks: validStagingTracks,
        selectedTrackIds: validSelectedTrackIds,
        onStagingTracksChange, onTracksDelete
    }))
  ]);
};

/*::
type TracksLibraryEditorProps = {
  assets: LocalAsset[],
  tracks: $ReadOnlyArray<AudioTrack>,
  stagingTrackData: LocalTrackData[],
  selectedTrackIds: AudioTrackID[],
  stagingTracks: StagingTrack[],
  onStagingTracksChange: StagingTrack[] => mixed,
  onTracksDelete: AudioTrack[] => mixed,
}
*/

const TracksLibraryEditor/*: Component<TracksLibraryEditorProps>*/ = ({
  assets,
  tracks, stagingTrackData,
  selectedTrackIds, stagingTracks,
  onStagingTracksChange, onTracksDelete
}) => {
  const selectableTracks = [...tracks, ...stagingTrackData.map(d => d.track)];
  const selectedTracks = selectedTrackIds
    .map(id => selectableTracks.find(track => track.id === id))
    .filter(Boolean);

  if (selectedTracks.length < 1)
    return h('p', {}, 'No Tracks Selected');

  const [editingTrackId, setEditingTrackId] = useState(null);
  const editingTrack = (
    selectedTracks.find(t => t.id === editingTrackId) ||
    selectedTracks[0]
  );
  const isStagingTrack = editingTrack && !!stagingTracks.find(s => s.id === editingTrack.id);

  const onSelectedChange = (trackId) => {
    setEditingTrackId(trackId)
  }

  const onSelectedTracksChange = ({ imageFile }) => {
    onStagingTracksChange(stagingTracks
      .map((stagingTrack) => {
        if (!selectedTrackIds.includes(stagingTrack.id))
          return stagingTrack;
        return {
          ...stagingTrack,
          imageFile: imageFile || stagingTrack.imageFile,
        };
      }))
  };
  const onEditingTrackChange = ({ title, artist, imageFile }/*: { title?: string, artist?: string, imageFile?: File }*/) => {
    onStagingTracksChange(stagingTracks
      .map((stagingTrack) => {
        if (stagingTrack.id !== editingTrack.id)
          return stagingTrack;
        return {
          ...stagingTrack,
          imageFile: imageFile || stagingTrack.imageFile,
          artist: artist || stagingTrack.artist,
          title: title || stagingTrack.title,
        };
      }))
  };

  const onEditingTrackDelete = () => {
    onStagingTracksChange(stagingTracks
      .filter(t => editingTrack.id !== t.id));
    if (!isStagingTrack)
     onTracksDelete([editingTrack]); 
  }
  const onSelectedTracksDelete = () => {
    onStagingTracksChange(stagingTracks
      .filter(t => !selectedTrackIds.includes(t.id)));
    onTracksDelete(tracks
      .filter(t => selectedTrackIds.includes(t.id)))
  }
  
  return [
    h('p', {}, `${selectedTracks.length} Tracks Selected`),
    !!editingTrack && h(SingleTrackEditor, {
      isStagingTrack,
      editingTrack, onEditingTrackChange, onEditingTrackDelete,
      selectedTracks, onSelectedChange,
      assets
    }),
    selectedTracks.length > 1 && [
      h('hr'),
      h(MassTrackEditor, { onSelectedTracksDelete, onSelectedTracksChange }),
    ]
  ]
};


const SingleTrackEditor = ({
  isStagingTrack,
  editingTrack, onEditingTrackChange, onEditingTrackDelete,
  selectedTracks, onSelectedChange,
  assets,
}) => {
  const onDeleteClick = () => {
    onEditingTrackDelete()
  };
  const audioAsset = assets.find(a => a.id === editingTrack.trackAudioAssetId);
  return h(EditorForm, {}, [
    h('h3', {}, 'Edit Single Track'),
    selectedTracks.length > 1 && h(SelectEditor, {
      label: 'Track to Edit',
      selected: editingTrack.id,
      onSelectedChange,
      values: selectedTracks.map(track => ({ title: track.title, value: track.id }))
    }),
    h(EditorTextInput, {
      text: editingTrack.title,
      label: 'Title',
      disabled: !isStagingTrack,
      onTextChange: title => onEditingTrackChange({ title })
    }),
    h(EditorTextInput, {
      text: editingTrack.artist || '',
      label: 'Artist',
      disabled: !isStagingTrack,
      onTextChange: artist => onEditingTrackChange({ artist })
    }),
    h(FilesButtonEditor, {
      label: `Set Cover Image`,
      accept: 'image/*',
      disabled: !isStagingTrack,
      onFilesChange: imageFiles => onEditingTrackChange({ imageFile: imageFiles[0] })
    }),
    h(EditorButton, { label: 'Delete Track', onButtonClick: onDeleteClick }),
    !!audioAsset &&
      h('audio', { controls: true, src: audioAsset.url.href, style: { margin: '8px' } })
  ]);
};


const MassTrackEditor = ({ onSelectedTracksChange, onSelectedTracksDelete }) => {
  const [imageFile, setImageFile] = useState(null); 
  const onFilesChange = (files) => {
    const file = files[0];
    setImageFile(file);
  }
  const onEditorSubmit = () => {
    onSelectedTracksChange({
      imageFile,
    });
  };
  const onDeleteClick = () => {
    onSelectedTracksDelete()
  }
  return h(EditorForm, { onEditorSubmit }, [
    h('h3', {}, 'Edit All Selected Tracks'),
    h(EditorButton, { label: 'Delete all Tracks', onButtonClick: onDeleteClick }),
    h(EditorHorizontalSection, {}, [
      h(FilesButtonEditor, { label: `Set Cover Image`, accept: 'image/*', onFilesChange }),
      imageFile && h('p', {}, imageFile.name),
      h(EditorButton, { label: "Clear", onButtonClick: () => setImageFile(null) })
    ]),
    h(EditorFormSubmit)
  ]);
}


const UploadTrackControls = ({ stagedTrackCount, onStagingTracksAdd, onSubmitStagingTracks }) => {
  const [uploadAsPlaylist, setUploadAsPlaylist] = useState(false) 
  const [playlistName, setPlaylistName] = useState('');

  const onEditorSubmit = (e) => {
    onSubmitStagingTracks(uploadAsPlaylist ? playlistName : null);
  }

  const onFilesChange = async (files) => {
    const stagingTracks = await Promise.all(files.map(async (file) => {
      const metadata = await parseAudioMetadata(file);
      const { title, albumartist, artist, duration, picture, album } = metadata;
      return {
        id: uuid(),
        audioFile: file,
        imageFile: picture,
      
        title,
        album,
        artist,
      
        trackLengthMs:  duration * 1000,
      }
    }));
    const firstTrack = stagingTracks[0];
    if (firstTrack && firstTrack.album) {
      setUploadAsPlaylist(true);
      setPlaylistName(firstTrack.album);
    }
    onStagingTracksAdd(stagingTracks);
  }

  return h(EditorForm, { onEditorSubmit }, [
    h(EditorHorizontalSection, {}, [
      h(EditorFormSubmit, { label: `Upload ${stagedTrackCount} tracks` }),
      h(FilesButtonEditor, { label: `Add Files to Upload`, multiple: true, accept: 'audio/*', onFilesChange })
    ]),
    h(EditorHorizontalSection, {}, [
      h(EditorCheckboxInput, {
        checked: uploadAsPlaylist,
        onCheckedChange: setUploadAsPlaylist,
        label: `Upload tracks as Playlist`
      }),
      h(EditorTextInput, {
        disabled: !uploadAsPlaylist,
        text: playlistName,
        onTextChange: name => setPlaylistName(name),
        label: `Playlist Name`
      }),
    ]),
  ]);
}