// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { IdentityProof } from '@astral-atlas/sesame-models'; */
/*:: import type { Connection, Resource, ResourceDescription, ConnectionDescription } from '@lukekaalim/net-description'; */
/*:: import type { AudioPlaylistID, AudioPlaylist, AudioTrack, AudioTrackID } from "../audio.js" */
/*:: import type { GameID } from "../game.js" */
/*:: import type { AssetID } from "../asset.js" */

/*::
import type { AssetInfo } from "../asset";
*/

import {
  createObjectCaster, createConstantCaster,
  createConstantUnionCaster, createNullableCaster,
  createArrayCaster,
  castString, castNumber, c
} from "@lukekaalim/cast";
import { castIdentityProof } from "@astral-atlas/sesame-models";

import { castGameId } from "../game.js";
import { castAudioTrack, castAudioTrackId, castAudioPlaylistId, castAudioPlaylist } from "../audio.js";
import { castAssetID, castAssetDescription } from "../asset.js";
import { castAssetInfo } from "../asset.js";

/*::
export type AudioPlaylistResource = {|
  GET: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: empty,
    response: { type: 'found', playlist: AudioPlaylist }
  },
  POST: {
    query: empty,
    request: { gameId: GameID, title: string, trackIds: $ReadOnlyArray<AudioTrackID> },
    response: { type: 'created', playlist: AudioPlaylist }
  },
  PUT: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: { title: ?string, trackIds: ?$ReadOnlyArray<AudioTrackID> },
    response: { type: 'updated', playlist: AudioPlaylist }
  },
  DELETE: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: empty,
    response: { type: 'deleted' }
  }
|}
export type AllAudioPlaylistsResource = {|
  GET: {
    query: { gameId: GameID},
    request: empty,
    response: {
      type: 'found', playlists: $ReadOnlyArray<AudioPlaylist>,
      relatedAssets: $ReadOnlyArray<[AssetID, ?AssetInfo]>
    }
  },
|};

export type AudioTrackResource = {|
  GET: {
    query: { gameId: GameID, trackId: AudioTrackID },
    request: empty,
    response: { type: 'found', track: AudioTrack }
  },
  POST: {
    query: empty,
    request: {
      title: string, artist: ?string,
      trackLengthMs: number, gameId: GameID,
      trackAudioAssetId: AssetID, coverImageAssetId: ?AssetID
    },
    response: { type: 'created', track: AudioTrack }
  },
  DELETE: {
    query: { gameId: GameID, trackId: AudioTrackID },
    request: empty,
    response: { type: 'deleted' }
  }
|}

export type AllAudioTracksResource = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: {
      type: 'found',
      tracks: $ReadOnlyArray<AudioTrack>,
      relatedAssets: $ReadOnlyArray<[AssetID, ?AssetInfo]>
    }
  },
|}

export type AudioAPI = {
  '/tracks': AudioTrackResource,
  '/tracks/all': AllAudioTracksResource,
  '/playlist': AudioPlaylistResource,
  '/playlist/all': AllAudioPlaylistsResource,
}
*/

export const audioTrackResourceDescription/*: ResourceDescription<AudioTrackResource> */ = {
  path: '/tracks',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId, trackId: castAudioTrackId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), track: castAudioTrack }),
  },
  POST: {
    toRequestBody: createObjectCaster({
      title: castString,
      artist: createNullableCaster(castString),
      trackLengthMs: castNumber,
      gameId: castGameId,
      trackAudioAssetId: castAssetID,
      coverImageAssetId: createNullableCaster(castAssetID)
    }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('created'), track: castAudioTrack }),
  },
  DELETE: {
    toQuery: createObjectCaster({ gameId: castGameId, trackId: castAudioTrackId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('deleted') }),
  }
};

export const allAudioTracksResourceDescription/*: ResourceDescription<AllAudioTracksResource> */ = {
  path: '/tracks/all',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId}),
    toResponseBody: createObjectCaster({
      type: createConstantCaster('found'),
      tracks: createArrayCaster(castAudioTrack),
      relatedAssets: c.arr(c.tup/*:: <[Cast<AssetID>, Cast<?AssetInfo>]>*/([
        castAssetID,
        c.maybe(castAssetInfo)
      ]))
    }),
  },
}

export const playlistResourceDescription/*: ResourceDescription<AudioPlaylistResource>*/ = {
  path: '/playlist',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), playlist: castAudioPlaylist }),
  },
  POST: {
    toRequestBody: createObjectCaster({ gameId: castGameId, title: castString, trackIds: createArrayCaster(castAudioTrackId) }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('created'), playlist: castAudioPlaylist }),
  },
  PUT: {
    toQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
    toRequestBody: createObjectCaster({ title: createNullableCaster(castString), trackIds: createNullableCaster(createArrayCaster(castAudioTrackId)) }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('updated'), playlist: castAudioPlaylist }),
  },
  DELETE: {
    toQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('deleted') }),
  }
};
export const allAudioPlaylistsResourceDescription/*: ResourceDescription<AllAudioPlaylistsResource> */ = {
  path: '/playlist/all',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId }),
    toResponseBody: createObjectCaster({
      type: createConstantCaster('found'),
      playlists: createArrayCaster(castAudioPlaylist),
      relatedAssets: c.arr(c.tup/*:: <[Cast<AssetID>, Cast<?AssetInfo>]>*/([
        castAssetID,
        c.maybe(castAssetInfo)
      ]))
    }),
  },
}

export const audioAPI = {
  '/tracks': audioTrackResourceDescription,
  '/tracks/all': allAudioTracksResourceDescription,
  '/playlist': playlistResourceDescription,
  '/playlist/all': allAudioPlaylistsResourceDescription,
};