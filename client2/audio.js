// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AssetDescription, GameID, AudioTrackID, AudioTrack, AudioPlaylist, AudioPlaylistID } from '@astral-atlas/wildspace-models'; */
/*:: import type { AssetClient } from './asset.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';

import { audioAPI, assetAPI } from "@astral-atlas/wildspace-models";


/*::
export type PlaylistClient = {
  create: (gameId: GameID, title: string, trackIds: AudioTrackID[]) => Promise<AudioPlaylist>,
  read: (gameId: GameID, audioPlaylistId: AudioPlaylistID) => Promise<AudioPlaylist>,
  update: (gameId: GameID, audioPlaylistId: AudioPlaylistID, opts: { title?: string, trackIds?: AudioTrackID[] }) => Promise<AudioPlaylist>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<AudioPlaylist>>,
  remove: (gameId: GameID, audioPlaylistId: AudioPlaylistID) => Promise<void>
};
*/

export const createPlaylistClient = (httpClient/*: HTTPClient*/, baseURL/*: string*/)/*: PlaylistClient*/ => {
  const playlistsResource = createJSONResourceClient(audioAPI['/playlist'], httpClient, `http://${baseURL}`);
  const allPlaylistsResource = createJSONResourceClient(audioAPI['/playlist/all'], httpClient, `http://${baseURL}`);

  const create = async (gameId, title, trackIds) => {
    const { body: { playlist }} = await playlistsResource.POST({ body: { trackIds, gameId, title }});
    return playlist;
  };
  const read = async (gameId, audioPlaylistId) => {
    const { body: { playlist }} = await playlistsResource.GET({ query: { audioPlaylistId, gameId }});
    return playlist;
  };
  const update = async (gameId, audioPlaylistId, { title = null, trackIds = null }) => {
    const { body: { playlist }} = await playlistsResource.PUT({ query: { audioPlaylistId, gameId }, body: { title, trackIds }});
    return playlist;
  };
  const list = async (gameId) => {
    const { body: { playlists }} = await allPlaylistsResource.GET({ query: { gameId }});
    return playlists;
  };
  const remove = async (gameId, audioPlaylistId) => {
    await playlistsResource.DELETE({ query: { audioPlaylistId, gameId }});
  }

  return {
    create,
    read,
    update,
    list,
    remove,
  };
};

/*::
export type AudioClient = {
  playlist: PlaylistClient,
  tracks: {
    create: (gameId: GameID, title: string, artist: ?string, MIMEType: string, trackLengthMs: number, trackData: Uint8Array) =>
      Promise<{ track: AudioTrack, asset: AssetDescription, trackDownloadURL: URL }>,
    read: (gameId: GameID, trackId: AudioTrackID) =>
      Promise<{ track: AudioTrack, asset: AssetDescription, trackDownloadURL: URL }>,
    list: (gameId: GameID) => Promise<$ReadOnlyArray<AudioTrack>>,
    remove: (gameId: GameID, trackId: AudioTrackID) => Promise<void>
  }
};
*/

export const createAudioTracksClient = (httpClient/*: HTTPClient*/, assetClient/*: AssetClient*/, baseURL/*: string*/)/*: AudioClient['tracks']*/ => {
  const tracksResource = createJSONResourceClient(audioAPI['/tracks'], httpClient, `http://${baseURL}`);
  const allTracksResource = createJSONResourceClient(audioAPI['/tracks/all'], httpClient, `http://${baseURL}`);

  const create = async (gameId, title, artist, MIMEType, trackLengthMs, data) => {
    const { description: asset, downloadURL:trackDownloadURL  } = await assetClient.create(`${gameId}/audio/${MIMEType}/${title}`, MIMEType, data);
    const { id: trackAudioAssetId } = asset;

    const { body: { track } } = await tracksResource.POST({ body: { gameId, title, artist, trackLengthMs, gameId, trackAudioAssetId, coverImageAssetId: null }})

    return { track, asset, trackDownloadURL };
  };
  const read = async (gameId, trackId) => {
    const { body: { track } } = await tracksResource.GET({ query: { gameId, trackId }});
    const { downloadURL: trackDownloadURL, description: asset } = await assetClient.peek(track.trackAudioAssetId);

    return { track, asset, trackDownloadURL };
  };
  const list = async (gameId) => {
    const { body: { tracks }} = await allTracksResource.GET({ query: { gameId } });
    return tracks;
  }
  const remove = async (gameId, trackId) => {
    await tracksResource.DELETE({ query: { trackId, gameId }});
  }

  return {
    create,
    read,
    list,
    remove,
  };
};

export const createAudioClient = (httpClient/*: HTTPClient*/, assetClient/*: AssetClient*/, baseURL/*: string*/)/*: AudioClient*/ => {
  return {
    playlist: createPlaylistClient(httpClient, baseURL),
    tracks: createAudioTracksClient(httpClient, assetClient, baseURL),
  }
};