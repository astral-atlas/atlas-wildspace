// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { createWildspaceClient } from '@astral-atlas/wildspace-client2';
import { useAsync, useGameUpdateTimes } from '@astral-atlas/wildspace-components';
import { AudioPlaylistLibrary } from '@astral-atlas/wildspace-components/asset/library/audioPlaylist';
import { h, useEffect, useState } from '@lukekaalim/act';

export const PlaylistLibraryDemo/*: Component<>*/ = ({}) => {
  const gameId = '0';

  const client = createWildspaceClient(null, 'http://127.0.0.1:5567', 'ws://127.0.0.1:5567');
  const updateTime = useGameUpdateTimes(client.game, gameId);
  const [tracksInGame, setTracks] = useState([]);
  const [playlistsInGame, setPlaylists] = useState([]);

  useEffect(() => {
    client.audio.tracks.list(gameId)
      .then(t => setTracks(t));
  }, [updateTime.tracks])
  useEffect(() => {
    client.audio.playlist.list(gameId)
      .then(t => setPlaylists(t));
  }, [updateTime.playlists])
  
  const [assetsInGame] = useAsync(async () => {
    const assetIds = tracksInGame
      .map(track => [track.trackAudioAssetId, track.coverImageAssetId].filter(Boolean))
      .flat(1);
    const assetsData = await Promise.all(assetIds.map(id => client.asset.peek(id)))
    return assetsData.map(d => ({ id: d.description.id, url: d.downloadURL }));
  }, [tracksInGame])

  return h('div', { style: { height: '600px', display: 'flex' }}, [
    h(AudioPlaylistLibrary, {
      assetsInGame: assetsInGame || [],
      gameId,
      playlistsInGame,
      tracksInGame,
      playlist: client.audio.playlist
    })
  ])
  
};