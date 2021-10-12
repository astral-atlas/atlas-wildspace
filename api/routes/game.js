// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "../services.js"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes, createResourceRoutes } from "@lukekaalim/http-server";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";
import { createCharacterRoutes } from './game/characters.js';
import { createPlayersRoutes } from './game/players.js';

import { gameAPI } from '@astral-atlas/wildspace-models'; 
import { defaultOptions } from './meta.js';

export const createGameRoutes = ({ data, auth, ...s }/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const gameResourceRoutes = createJSONResourceRoutes(gameAPI['/games'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }, headers: { authorization }}) => {
      const identity = await auth.getAuthFromHeader(authorization);
      const game = await s.game.get(gameId, identity);
    
      if (!game)
        return { status: HTTP_STATUS.not_found };
      return { status: HTTP_STATUS.ok, body: { type: 'found', game } };
    },
    POST: async ({ body: { name }, headers: { authorization } }) => {
      const identity = await auth.getAuthFromHeader(authorization);
      const game = await s.game.create(name, identity);
      return { status: HTTP_STATUS.created, body: { type: 'created', game } };
    },
    PUT: async ({ query: { gameId }, body: { name }, headers: { authorization }}) => {
      const identity = await auth.getAuthFromHeader(authorization);
      await s.game.update(gameId, name, identity);
      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    },
  });
  const allGamesResource = createJSONResourceRoutes(gameAPI['/games/all'], {
    ...defaultOptions,

    GET: async ({ headers: { authorization } }) => {
      const identity = await auth.getAuthFromHeader(authorization);
      const games = await s.game.all(identity);
      return { status: HTTP_STATUS.ok, body: { type: 'found', games } };
    },
  });
  const gameUpdatesRoute = createResourceRoutes({
    ...defaultOptions,
    path: '/games/updates',

    methods: {
      GET: () => {
        return { status: HTTP_STATUS.switching_protocols, body: null, headers: {} };
      }
    }
  });
  const gameUpdates = createJSONConnectionRoute(gameAPI['/games/updates'], ({ query: { gameId }, send }, socket) => {
    const { unsubscribe } = data.gameUpdates.subscribe(gameId, update => {
      send({ type: 'updated', update });
    });
    socket.addEventListener('close', () => unsubscribe());
  });

  const characterRoutes = createCharacterRoutes({ ...s, auth, data });
  const playersRoutes= createPlayersRoutes({ ...s, auth, data });
  const http = [
    ...playersRoutes.http,
    ...characterRoutes.http,
    ...gameResourceRoutes,
    ...allGamesResource,
    ...gameUpdatesRoute,
  ];
  const ws = [
    ...characterRoutes.ws,
    gameUpdates,
  ];
  return { http, ws };
};