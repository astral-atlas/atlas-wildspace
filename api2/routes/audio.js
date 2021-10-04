// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes } from "@lukekaalim/http-server";

import { audioAPI } from '@astral-atlas/wildspace-models'; 

export const createAudioRoutes = (data/*: WildspaceData*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {

  const trackResourceRoutes = createJSONResourceRoutes(audioAPI['/tracks'], {
    access: { origins: { type: 'wildcard' }, methods: ['GET'], headers: ['content-type'] },

    GET: async ({ query: { gameId, trackId }}) => {
      const { result: track } = await data.tracks.get({ partition: gameId, sort: trackId });
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

      await data.tracks.set({ partition: gameId, sort: track.id }, track);
      
      return { status: HTTP_STATUS.ok, body: { type: 'created', track } };
    }
  })

  const allTracksResourceRoutes = createJSONResourceRoutes(audioAPI['/tracks/all'], {
    access: { origins: { type: 'wildcard' }, methods: ['GET'], headers: ['content-type'] },

    GET: async ({ query: { gameId }}) => {
      const { result: tracks } = await data.tracks.query(gameId);
      
      return { status: HTTP_STATUS.ok, body: { type: 'found', tracks } };
    },
  })

  const ws = [

  ];
  const http = [
    ...trackResourceRoutes,
    ...allTracksResourceRoutes,
  ]

  return { ws, http };
};