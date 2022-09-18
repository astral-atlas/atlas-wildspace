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
import { createUpdatesRoutes } from "./game/updates.js";
import { createLibraryRoutes } from './game/library.js';
import { createMonsterRoutes } from "./game/monsters.js";
import { createMiniTheaterRoutes } from "./game/miniTheater.js";
import { createGameRoomsRoutes } from "./game/rooms.js";
import { createResourcesRoutes } from './game/resources.js';

export const createGameRoutes = (services/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const { data, auth, ...s } = services;

  const gameResourceRoutes = createJSONResourceRoutes(gameAPI['/games'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }, headers: { authorization }}) => {
      console.log('GET')
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

  const characterRoutes = createCharacterRoutes({ ...s, auth, data });
  const playersRoutes= createPlayersRoutes({ ...s, auth, data });
  const encounterRoutes= createEncounterRoutes({ ...s, auth, data });
  const sceneRoutes = createSceneRoutes({ ...s, auth, data });
  const locationRoutes = createLocationsRoutes({ ...s, auth, data });
  const magicItemRoutes = createMagicItemRoutes(services);
  const wikiRoutes = createWikiRoutes(services);
  const updatesRoute = createUpdatesRoutes(services);
  const libraryRoutes = createLibraryRoutes(services);
  const monsterRoutes = createMonsterRoutes(services);
  const miniTheaterRoutes = createMiniTheaterRoutes(services)
  const gameRoomsRoutes = createGameRoomsRoutes(services);
  const resourceRoutes = createResourcesRoutes(services);
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
    ...updatesRoute.http,
    ...libraryRoutes.http,
    ...monsterRoutes.http,
    ...miniTheaterRoutes.http,
    ...gameRoomsRoutes.http,
    ...resourceRoutes.http,
  ];
  const ws = [
    ...characterRoutes.ws,
    ...encounterRoutes.ws,
    ...updatesRoute.ws,
    ...libraryRoutes.ws,
    ...monsterRoutes.ws,
    ...gameRoomsRoutes.ws,
  ];
  return { http, ws };
};