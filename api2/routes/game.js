// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes } from "@lukekaalim/http-server";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";

import { gameAPI } from '@astral-atlas/wildspace-models'; 
import { defaultOptions } from './meta.js';

export const createGameRoutes = (data/*: WildspaceData*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const gameResourceRoutes = createJSONResourceRoutes(gameAPI['/games'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: game } = await data.game.get(gameId);
      if (!game)
        return { status: HTTP_STATUS.not_found };
      return { status: HTTP_STATUS.ok, body: { type: 'found', game } };
    },
    POST: async ({ body: { name, playerIds }}) => {
      const game = {
        id: uuid(),
        name,
        playerIds,
        gameMasterId: 'me, of course',
      };

      await data.game.set(game.id, game);

      return { status: HTTP_STATUS.created, body: { type: 'created', game } };
    },
    PUT: async ({ query: { gameId }, body: { name, playerIds }}) => {
      const { result: prevGame } = await data.game.get(gameId);
      if (!prevGame)
        return { status: HTTP_STATUS.not_found };
      const nextGame = {
        ...prevGame,
        name: name || prevGame.name,
        playerIds: playerIds || prevGame.playerIds,
      };

      await data.game.set(nextGame.id, nextGame);

      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    },
  });
  const allGamesResource = createJSONResourceRoutes(gameAPI['/games/all'], {
    ...defaultOptions,

    GET: async () => {
      const { result: games } = await data.game.scan()
      return { status: HTTP_STATUS.ok, body: { type: 'found', games } };
    },
  });
  const joinGameResource = createJSONResourceRoutes(gameAPI['/games/join'], {
    ...defaultOptions,

    POST: async ({ body: { gameId }}) => {
      const { result: prevGame } = await data.game.get(gameId);
      if (!prevGame)
        return { status: HTTP_STATUS.not_found };
      const nextGame = {
        ...prevGame,
        playerIds: [...prevGame.playerIds, 'itsa-me, playa!']
      };
      await data.game.set(nextGame.id, nextGame);

      return { status: HTTP_STATUS.ok, body: { type: 'joined' } };
    },
  });
  

  const http = [
    ...gameResourceRoutes,
    ...allGamesResource,
    ...joinGameResource,
  ];
  const ws = [
    
  ];
  return { http, ws };
};