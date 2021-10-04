// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameID, AudioTrackID, AudioTrack, AssetDescription } from '@astral-atlas/wildspace-models'; */
/*:: import type { AssetClient } from './asset.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';

import { audioAPI, assetAPI } from "@astral-atlas/wildspace-models";


/*::
export type AudioClient = {
  tracks: {
    create: (gameId: GameID, title: string, artist: ?string, MIMEType: string, trackLengthMs: number, trackData: Uint8Array) =>
      Promise<{ track: AudioTrack, asset: AssetDescription, trackDownloadURL: URL }>,
    read: (gameId: GameID, trackId: AudioTrackID) =>
      Promise<{ track: AudioTrack, asset: AssetDescription, trackDownloadURL: URL }>,
    list: (gameId: GameID) => Promise<$ReadOnlyArray<AudioTrack>>
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

  return {
    create,
    read,
    list,
  };
};

export const createAudioClient = (httpClient/*: HTTPClient*/, assetClient/*: AssetClient*/, baseURL/*: string*/)/*: AudioClient*/ => {
  return {
    tracks: createAudioTracksClient(httpClient, assetClient, baseURL),
  }
};