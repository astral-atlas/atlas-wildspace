// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { AudioPlaylistState, AudioTrack, AudioPlaylist } from '@astral-atlas/wildspace-models'; */

import {
  TracksLibrary,
  calculateTrackDataSums, RoomAudioPlayer,
  usePlaybackData, PlaylistTrackControl,
  TrackUploadInfo, PlaylistEditor, UploadTrackInput, applyLocalStagingTrack, useTrackUploader, useLocalTrackData, useGameUpdateTimes, useAsync
} from "@astral-atlas/wildspace-components";
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';
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

  const playlist = playlists.find(p => selection.playlists[0] && p.id === selection.playlists[0]);
  const trackIds = (playlist ? playlist.trackIds : selection.tracks) || [];

  const onSelect = (newSelection) => {
    setSelection(newSelection)
    const playlist = playlists.find(p => newSelection.playlists[0] && p.id === newSelection.playlists[0]);
    const nextTrackIds = (playlist ? playlist.trackIds : newSelection.tracks) || [];
    if (!trackIds.every((id, i) => nextTrackIds[i] === id))
      setAudio(a => ({ ...a, playlistStartTime: Date.now() }))
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

  const onPlaylistChange = (nextPlaylist) => {
    setPlaylists(playlists => playlists.map(p => p.id !== nextPlaylist.id ? p : nextPlaylist ));
  }
  const onDeletePlaylist = () => {
    setPlaylists(playlists => playlists.filter(p => !playlist || p.id !== playlist.id ));
  }

  const [client] = useState(createWildspaceClient(null, 'http://127.0.0.1:5567', 'ws://127.0.0.1:5567'))

  const [mimeLib, setMimeLib] = useState(null);
  useEffect(() => {
    (async () => {
      setMimeLib(await import('mime/lite'));
    })()
  }, [])
  if (!mimeLib)
    return null;

  const [uploadTracks, qs, rs, co] = useTrackUploader(3,
    async (stagingTrack) => {
      const imageFile = stagingTrack.imageFile;
      const cover = imageFile && {
        mime: mimeLib.getType(imageFile.type) || 'application/octet-stream',
        data: new Uint8Array(await imageFile.arrayBuffer())
      };
      
      const trackData = await client.audio.tracks.create(
        '0', stagingTrack.title,
        stagingTrack.artist, mimeLib.getType(stagingTrack.audioFile.name) || 'application/octet-stream',
        stagingTrack.trackLengthMs, new Uint8Array(await stagingTrack.audioFile.arrayBuffer()),
        { cover }
      )
      return trackData;
    },
    (_, { asset, track, trackDownloadURL, coverDownloadURL }) => {
      setTracks(t => [...t, track])
      setAssets(a => [
        ...a,
        { id: asset.id, url: trackDownloadURL },
        coverDownloadURL && track.coverImageAssetId ? { id: track.coverImageAssetId, url: coverDownloadURL } : null
      ].filter(Boolean));
    },
    [mimeLib]
  );

  const onStagingTracksSubmit = async (stagingTracks, playlistName) => {
    setStagingTracks([])
    const trackData = await uploadTracks(stagingTracks);

    //setTracks([...tracks, ...trackData.map(t => t.track)])
    //setAssets([...assets, ...trackData.map(t => ({ id: t.asset.id, url: t.trackDownloadURL }))]);
    if (playlistName) {
      const playlist = await client.audio.playlist.create('0', playlistName, trackData.map(t => t.track.id));
      setPlaylists(p => [...p, playlist]);
    }
  }
  const [stagingTracks, setStagingTracks] = useState([])

  return [
    h('ol', {}, [
      qs.map(order => h('li', {}, [
        h('ol', {}, [
          order.targets.map(track => {
            const inProgress = !!rs.find(r => r.target === track);
            const isDone = co.find(c => c.target === track)

            return h('li', {}, [
              h('span', {}, track.title),
              h('input', { type: 'checkbox', disabled: true, checked: isDone }),
              inProgress && h('progress')
            ])
          })
        ]),
      ])),
    ]),
    //h(AudioLibrary, { playlists, tracks, assets, selection, onSelect }),

    !!playlist && h(PlaylistEditor, { playlist, tracks, assets, onPlaylistChange, playlists, onDeletePlaylist }),

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
    h(UploadTrackInput, { onStagingTracksChange: t => setStagingTracks(t), stagingTracks, onStagingTracksSubmit, disabled: false }),
  ];
};

export const AudioAssetLibraryDemo/*: Component<>*/ = () => {
  const ref = useRef();
  const onClick = () => {
    ref.current && ref.current.requestFullscreen()
  }
  const [tracksInGame, setTracks] = useState([]);
  
  const client = createWildspaceClient(null, 'http://127.0.0.1:5567', 'ws://127.0.0.1:5567');
  const updateTime = useGameUpdateTimes(client.game, '0');
  useEffect(() => {
    client.audio.tracks.list('0')
      .then(t => setTracks(t));
  }, [updateTime.tracks])
  const [loadedAssets] = useAsync(async () => {
    const assetIds = tracksInGame
      .map(track => [track.trackAudioAssetId, track.coverImageAssetId].filter(Boolean))
      .flat(1);
    const assetsData = await Promise.all(assetIds.map(id => client.asset.peek(id)))
    return assetsData.map(d => ({ id: d.description.id, url: d.downloadURL }));
  }, [tracksInGame])
  const assets = loadedAssets || [];

  return [
    h('button', { onClick }, 'Fullscreen'),
    h('div', { ref, style: {
      backgroundColor: 'white',
      width: '100%', height: '600px',
      display: 'flex', flexDirection: 'column'
    } },
      h(TracksLibrary, {
        tracksInGame,
        assetsInGame: assets,
        playlistClient: client.audio.playlist,
        trackClient: client.audio.tracks,
        gameId: '0'
      }))
  ];
}