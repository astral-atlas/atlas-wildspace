// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { AudioPlaylistState, AudioTrack, AudioPlaylist } from '@astral-atlas/wildspace-models'; */

import {
  calculateTrackDataSums, RoomAudioPlayer,
  usePlaybackData, PlaylistTrackControl,
  TrackUploadInfo, AudioLibrary
} from "@astral-atlas/wildspace-components";
import { h, useEffect, useState, useMemo, useRef } from "@lukekaalim/act";
import parseAudioMetadata from "parse-audio-metadata";
import { v4 as uuid } from 'uuid';

const initialAudioState = {
  globalVolume: 1,
  playState: 'stopped',
  playlistId: '0',
  playlistStartTime: 0,
  trackIndex: 0
}

export const PlayerDemo/*: Component<>*/ = () => {
  const [ready, setReady] = useState(false);
  const [audio, setAudio] = useState/*:: <AudioPlaylistState>*/(initialAudioState);
  const [tracks, setTracks] = useState/*:: <AudioTrack[]>*/([]);
  const [assets, setAssets] = useState/*:: <{ id: string, url: URL }[]>*/([]);
  const [playlists, setPlaylists] = useState/*:: <AudioPlaylist[]>*/([]);

  const [selection, setSelection] = useState({ tracks: [], playlists: [] });

  const [trackIds, setTrackIds] = useState([]);
  const onSelect = (newSelection) => {
    setSelection(newSelection)
    const playlist = playlists.find(p => newSelection.playlists[0] && p.id === newSelection.playlists[0]);
    const nextTrackIds = (playlist ? playlist.trackIds : newSelection.tracks) || [];
    if (!trackIds.every((id, i) => nextTrackIds[i] === id))
      setAudio(a => ({ ...a, playlistStartTime: Date.now() }))
    setTrackIds(nextTrackIds)
    
  }

  const tracksData = trackIds
      .map(trackId => tracks.find(track => track.id === trackId))
      .filter(Boolean)
      .map(track => ({
        track,
        trackDownloadURL: assets.find(asset => asset.id === track.trackAudioAssetId)?.url
      })) || []

  const getPlaybackData = usePlaybackData(audio, tracksData);
  const sums = calculateTrackDataSums(tracksData)

  const playTrack = (index, offset = 0) => {
    const playlistStartTime = Date.now() - (sums[index - 1] || 0) - offset;
    setAudio(a => ({
      ...a,
      playState: 'playing',
      playlistStartTime,
    }))
  }

  const upload = async (stagingTracks, playlist, onProgress) => {
    await new Promise(r => {
      let progress = 0;
      const id = setInterval(() => {
        progress += 0.1;
        onProgress(progress);
        if (progress >= 1) {
          r();
          clearInterval(id);
        }
      }, 50);
    })

    const nextTrackData = stagingTracks.map(stagingTrack => {
      const trackAsset = stagingTrack.trackURL && {
        id: uuid(),
        url: stagingTrack.trackURL,
      };
      const imageAsset = stagingTrack.imageURL && {
        id: uuid(),
        url: stagingTrack.imageURL,
      };

      const track = {
        gameId: '0',
        id: uuid(),
        title: stagingTrack.title,
        artist: stagingTrack.artist,

        trackLengthMs: stagingTrack.trackLengthMs,

        trackAudioAssetId: trackAsset && trackAsset.id,
        coverImageAssetId: imageAsset && imageAsset.id,
      }
      const assets = [
        trackAsset,
        imageAsset,
      ].filter(Boolean);
      return { track, assets }
    })

    setAssets(assets => [
      ...assets,
      ...nextTrackData.map(data => data.assets).flat(1)
    ])
    setTracks(tracks => [
      ...tracks,
      ...nextTrackData.map(data => data.track).flat(1)
    ])
    if (playlist) {
      const nextPlaylist = {
        id: uuid(),
        trackIds: nextTrackData.map(data => data.track.id),
        title: playlist,
        gameId: '0'
      }
      setPlaylists(playlists => [...playlists, nextPlaylist])
    }
  }

  return [

    h(AudioLibrary, { playlists, tracks, assets, selection, onSelect }),

    !ready && h('button', { onClicK: () => setReady(true) }, "Ready"),

    h('hr'),
    
    ready && h(RoomAudioPlayer, { audio, tracksData, controls: true, volume: 0.2 }),
    h('div', { style: { display: 'flex', flexDirection: 'column' } }, [
      tracksData.map((trackData, index) =>
        h(PlaylistTrackControl, {
          track: trackData.track,
          trackIndex: index,
          getPlaybackData,
          onProgressChange: offset => playTrack(index, offset)
        }))
    ]),

    h('hr'),
    h(StagingTracks, { upload })
  ];
};

const StagingTracks = ({ upload }) => {
  const [stagingTracks, setStagingTracks] = useState([]);
  const noTracks = stagingTracks.length === 0;
  const onChange = async (e) => {
    const files = [...e.target.files];
    e.target.value = null;

    const nextTracks = await Promise.all(files.map(async (file) => {
      const metadata = await parseAudioMetadata(file);
      const { title, albumartist, artist, duration, picture, album } = metadata;
      return {
        file,
        pictureFile: picture,
        title,
        album,
        imageURL: picture && new URL(URL.createObjectURL(picture)),
        trackURL: new URL(URL.createObjectURL(file)),
        artist,
        trackLengthMs: duration * 1000,
      }
    }));
    const firstTrack = nextTracks[0];
    if (firstTrack && firstTrack.album) {
      setUploadAsPlaylist(true);
      setPlaylistName(firstTrack.album);
    }
    setStagingTracks(prev => [...prev, ...nextTracks]);
  }
  const [uploadProgress, setUploadProgress] = useState(-1);
  const isUploading = uploadProgress !== -1;
  const onSubmit = async (e) => {
    if (isUploading)
      return;
    
    e.preventDefault();
    await upload(stagingTracks, uploadAsPlaylist && playlistName, (progress) => {
      setUploadProgress(progress)
    })
    setUploadProgress(-1);
    setStagingTracks([]);
    setPlaylistName('');
  }

  const [uploadAsPlaylist, setUploadAsPlaylist] = useState(false) 
  const [playlistName, setPlaylistName] = useState('') 

  return [
    h('form', { onSubmit, disabled: isUploading }, [
      h('input', { type: 'file', multiple: true, accept: 'audio/*', files: null, onChange }),
      h('input', { type: 'submit', disabled: noTracks || isUploading, value: `Upload ${stagingTracks.length} tracks` }),
      h('label', {}, [
        h('span', {}, 'Upload as Playlist'),
        h('input', { type: 'checkbox', checked: uploadAsPlaylist, onChange: e => setUploadAsPlaylist(e.target.checked) })
      ]),
      uploadAsPlaylist && h('label', {}, [
        h('span', {}, 'Playlist Name'),
        h('input', { type: 'text', value: playlistName, onInput: e => setPlaylistName(e.target.value) })
      ]),
      isUploading && h('progress', { value: uploadProgress, min: 0, max: 1, step: 0.01, style: { width: '100%', display: 'block' } })
    ]),

    h('div', { style: { display: 'grid', ['grid-template-columns']: 'repeat(4, 1fr)' } }, [
      stagingTracks.map(trackData => h(TrackUploadInfo, {
        file: trackData.file,
        artist: trackData.artist,
        title: trackData.title,
        trackURL: trackData.trackURL,
        imageURL: trackData.imageURL,
      }))
    ]),  
  ];
}