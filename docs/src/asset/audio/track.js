// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { AudioPlaylistState, AudioTrack, AudioPlaylist } from '@astral-atlas/wildspace-models'; */

import {
  TracksLibrary,
  calculateTrackDataSums, RoomAudioPlayer,
  usePlaybackData, PlaylistTrackControl,
  TrackUploadInfo, PlaylistEditor, applyLocalStagingTrack, useTrackUploader, useLocalTrackData, useGameUpdateTimes, useAsync
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

export const TrackLibraryDemo/*: Component<>*/ = () => {
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