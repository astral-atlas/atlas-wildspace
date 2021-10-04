// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { IdentityProof } from '@astral-atlas/sesame-models'; */
/*:: import type { Connection, Resource, ResourceDescription, ConnectionDescription } from '@lukekaalim/net-description'; */
/*:: import type { AudioPlaylistState, AudioPlaylistID, AudioPlaylist, AudioTrack, AudioTrackID } from "../audio.js" */
/*:: import type { GameID } from "../game.js" */
/*:: import type { AssetID } from "../asset.js" */

import {
  createObjectCaster, createConstantCaster,
  createConstantUnionCaster, createNullableCaster,
  createArrayCaster,
  castString, castNumber
} from "@lukekaalim/cast";
import { castIdentityProof } from "@astral-atlas/sesame-models";

import { castGameId } from "../game.js";
import { castAudioTrack, castAudioTrackId, castAudioPlaylistId, castAudioPlaylistState, castAudioPlaylist } from "../audio.js";
import { castAssetID } from "../asset.js";

/*::
export type AudioPlaylistStateConnection = Connection<
  { type: 'update', state: AudioPlaylistState },
  { type: 'identify', proof: IdentityProof },
  { gameId: GameID, audioPlaylistId: AudioPlaylistID },
>;

export type AudioPlaylistStateResource = {|
  GET: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: empty,
    response: { type: 'found', state: AudioPlaylistState }
  },
  PUT: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: { state: AudioPlaylistState },
    response: { type: 'updated' }
  }
|};

export type AudioPlaylistResource = {|
  GET: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: empty,
    response: { type: 'found', playlist: AudioPlaylist }
  },
  POST: {
    query: { gameId: GameID },
    request: { title: string, tracks: AudioTrackID[] },
    response: { type: 'created', playlist: AudioPlaylist }
  },
  PUT: {
    query: { gameId: GameID, audioPlaylistId: AudioPlaylistID },
    request: { title: string, tracks: AudioTrackID[] },
    response: { type: 'updated', playlist: AudioPlaylist }
  }
|}

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
  }
|}

export type AllAudioTracksResource = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: { type: 'found', tracks: $ReadOnlyArray<AudioTrack> }
  },
|}

export type AudioAPI = {
  '/tracks': AudioTrackResource,
  '/tracks/all': AllAudioTracksResource,
  '/playlist': AudioPlaylistResource,
  '/playlist/state': {
    connection: AudioPlaylistStateConnection,
    resource: AudioPlaylistStateResource,
  }
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
  }
};

export const allSudioTracksResourceDescription/*: ResourceDescription<AllAudioTracksResource> */ = {
  path: '/tracks/all',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId}),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), tracks: createArrayCaster(castAudioTrack) }),
  },
}

export const playlistStateConnectionDescription/*: ConnectionDescription<AudioPlaylistStateConnection>*/ = {
  path: '/playlist/state',
  subprotocol: 'JSON.wildspace.playlist_state.v1.0.0',
  castQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
  castServerMessage: createObjectCaster({ type: createConstantCaster('update'), state: castAudioPlaylistState }),
  castClientMessage: createObjectCaster({ type: createConstantCaster('identify'), proof: castIdentityProof }),
};

export const playlistStateResourceDescription/*: ResourceDescription<AudioPlaylistStateResource>*/ = {
  path: '/playlist/state',

  PUT: {
    toQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
    toRequestBody: createObjectCaster({ state: castAudioPlaylistState  }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('updated') }),
  }
};

export const playlistResourceDescription/*: ResourceDescription<AudioPlaylistResource>*/ = {
  path: '/playlist',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId, audioPlaylistId: castAudioPlaylistId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), playlist: castAudioPlaylist }),
  }
};

export const audioAPI = {
  '/tracks': audioTrackResourceDescription,
  '/tracks/all': allSudioTracksResourceDescription,
  '/playlist': playlistResourceDescription,
  '/playlist/state': {
    connection: playlistStateConnectionDescription,
    resource: playlistStateResourceDescription,
  }
};