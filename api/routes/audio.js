// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "../services.js"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes } from "@lukekaalim/http-server";

import { audioAPI } from '@astral-atlas/wildspace-models'; 
import { defaultOptions } from './meta.js';

export const createAudioRoutes = ({ data }/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {

  const trackResourceRoutes = createJSONResourceRoutes(audioAPI['/tracks'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, trackId }}) => {
      const { result: track } = await data.tracks.get(gameId, trackId);
      if (!track)
        return { status: HTTP_STATUS.not_found }
      
      return { status: HTTP_STATUS.ok, body: { type: 'found', track } };
    },
    POST: async ({ body: { gameId, title, artist, trackLengthMs, trackAudioAssetId, coverImageAssetId }}) => {
      const track = {
        id: uuid(),
        gameId,
        title,
        artist,
        trackLengthMs,
        trackAudioAssetId,
        coverImageAssetId,
      };

      await data.tracks.set(gameId, track.id, track);
      data.gameUpdates.publish(gameId, { type: 'tracks' });
      
      return { status: HTTP_STATUS.ok, body: { type: 'created', track } };
    },
    DELETE: async ({ query: { gameId, trackId }}) => {
      await data.tracks.set(gameId, trackId, null);
      data.gameUpdates.publish(gameId, { type: 'tracks' });
      
      return { status: HTTP_STATUS.ok, body: { type: 'deleted' } };
    },
  })

  const allTracksResourceRoutes = createJSONResourceRoutes(audioAPI['/tracks/all'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: tracks } = await data.tracks.query(gameId);
      
      return { status: HTTP_STATUS.ok, body: { type: 'found', tracks } };
    },
  })

  const playlistResourceRoutes = createJSONResourceRoutes(audioAPI['/playlist'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, audioPlaylistId }}) => {
      const { result: playlist } = await data.playlists.get(gameId, audioPlaylistId);
      if (!playlist)
        return { status: HTTP_STATUS.not_found }
      
      return { status: HTTP_STATUS.ok, body: { type: 'found', playlist } };
    },
    POST: async ({ body: { gameId, title, trackIds }}) => {
      const playlist = {
        id: uuid(),
        gameId,
        title,
        trackIds,
      };

      await data.playlists.set(gameId, playlist.id, playlist);
      data.gameUpdates.publish(gameId, { type: 'playlists' });
      
      return { status: HTTP_STATUS.created, body: { type: 'created', playlist } };
    },
    PUT: async ({ query: { audioPlaylistId, gameId }, body: { title, trackIds }}) => {
      const { result: prevPlaylist } = await data.playlists.get(gameId, audioPlaylistId);
      if (!prevPlaylist)
        return { status: HTTP_STATUS.not_found }
      const nextPlaylist = {
        ...prevPlaylist,
        trackIds: trackIds || prevPlaylist.trackIds,
        title: title || prevPlaylist.title,
      };

      await data.playlists.set(gameId, nextPlaylist.id, nextPlaylist);
      data.gameUpdates.publish(gameId, { type: 'playlists' });
      
      return { status: HTTP_STATUS.ok, body: { type: 'updated', playlist: nextPlaylist } };
    },
    DELETE: async ({ query: { gameId, audioPlaylistId }}) => {
      await data.playlists.set(gameId, audioPlaylistId, null);
      data.gameUpdates.publish(gameId, { type: 'playlists' });
      
      return { status: HTTP_STATUS.ok, body: { type: 'deleted' } };
    },
  })

  const allPlaylistsResourceRoutes = createJSONResourceRoutes(audioAPI['/playlist/all'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: playlists } = await data.playlists.query(gameId);
      
      return { status: HTTP_STATUS.ok, body: { type: 'found', playlists } };
    },
  })

  const ws = [

  ];
  const http = [
    ...trackResourceRoutes,
    ...allTracksResourceRoutes,
    ...playlistResourceRoutes,
    ...allPlaylistsResourceRoutes,
  ]

  return { ws, http };
};