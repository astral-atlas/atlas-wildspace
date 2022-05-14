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
import { createMetaRoutes, defaultOptions } from './meta.js';
import { createEncounterRoutes } from './game/encounters.js';
import { createSceneRoutes } from './game/scene.js';
import { createLocationsRoutes } from "./game/locations.js";
import { createMagicItemRoutes } from './game/magicItem.js';
import { createWikiRoutes } from "./game/wiki.js";

export const createGameRoutes = (services/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const { data, auth, ...s } = services;
  const { createGameConnection } = createMetaRoutes(services);

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
  const gameUpdates = createGameConnection(gameAPI['/games/updates'], {
    getGameId: r => r.gameId,
    scope: { type: 'player-in-game' },
    async handler({ connection: { query: { gameId }, send, addRecieveListener }, socket, identity }) {
      const connectionId = uuid();
      send({ type: 'connected', connectionId });

      const { unsubscribe } = data.gameUpdates.subscribe(gameId, update => {
        send({ type: 'updated', update });
      });
  
      const interval = setInterval(() => {
        socket.ping(Date.now());
        services.game.connection.heartbeat(gameId, connectionId, identity.grant.identity, Date.now())
      }, 1000)
  

      const wikiClient = services.game.wiki.connectClient(gameId, connectionId, identity.grant, event => send({ type: 'wiki', event }))
      const { removeListener } = addRecieveListener(m => void (async (message) => {
        try {
          switch (message.type) {
            case 'wiki':
              return await wikiClient.handleAction(message.action);
          }
        } catch (error) {
          console.error(error);
        }
      })(m))
  
      socket.addEventListener('close', () => {
        clearInterval(interval)
        unsubscribe()
        removeListener();
        wikiClient.disconnect();
        services.game.connection.disconnect(gameId, connectionId);
        services.game.connection.getValidConnections(gameId, Date.now());
      });
    }
  })

  const characterRoutes = createCharacterRoutes({ ...s, auth, data });
  const playersRoutes= createPlayersRoutes({ ...s, auth, data });
  const encounterRoutes= createEncounterRoutes({ ...s, auth, data });
  const sceneRoutes = createSceneRoutes({ ...s, auth, data });
  const locationRoutes = createLocationsRoutes({ ...s, auth, data });
  const magicItemRoutes = createMagicItemRoutes(services);
  const wikiRoutes = createWikiRoutes(services);
  const http = [
    ...playersRoutes.http,
    ...encounterRoutes.http,
    ...characterRoutes.http,
    ...gameResourceRoutes,
    ...allGamesResource,
    ...gameUpdatesRoute,
    ...sceneRoutes.http,
    ...locationRoutes.http,
    ...magicItemRoutes.http,
    ...wikiRoutes.http,
  ];
  const ws = [
    ...characterRoutes.ws,
    ...encounterRoutes.ws,
    gameUpdates,
  ];
  return { http, ws };
};