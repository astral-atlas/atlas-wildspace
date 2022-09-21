// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";
*/
import { createMetaRoutes, createCRUDConstructors } from "../meta.js";
import { createTerrainRoutes } from "./miniTheater/terrain.js";
import { gameAPI, isPermissableAction } from "@astral-atlas/wildspace-models";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from "uuid";

export const createMiniTheaterRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const miniTheaterRoutes = createGameCRUDRoutes(gameAPI["/mini-theater"], {
    name: 'miniTheater',
    idName: 'miniTheaterId',
    gameUpdateType: 'mini-theater',
    async create({ game, body: { miniTheater: { name } }}) {
      const miniTheater = {
        id: uuid(),
        name,
        version: uuid(),

        baseArea: { position: { x: 0, y: 0, z: 0}, size: { x: 10, y: 10, z: 1 } },
        pieces: [],
        layers: [],
        terrain: []
      };
      await services.data.gameData.miniTheaters.set(game.id, miniTheater.id, miniTheater);
      return miniTheater;
    },
    async read({ game }) {
      const { result: miniTheaters } = await services.data.gameData.miniTheaters.query(game.id);
      return miniTheaters;
    },
    async update({ game, query: { miniTheaterId }, body: { miniTheater } }) {
      const { prev, next } = await services.data.gameData.miniTheaters.transaction(game.id, miniTheaterId, prev => {
        const next = {
          ...prev,
          name: miniTheater.name || prev.name,
          pieces: miniTheater.pieces || prev.pieces,
          baseArea: miniTheater.baseArea || prev.baseArea,
          version: uuid(),
          id: miniTheaterId,
        };
        return next;
      }, 3);
      services.data.gameData.miniTheaterEvents.publish(miniTheaterId, { type: 'update', next });
      return next;
    },
    async destroy({ game, query: { miniTheaterId } }) {
      await services.data.gameData.miniTheaters.set(game.id, miniTheaterId, null);
    }
  });

  const miniTheaterByIdRoutes = createAuthorizedResource(gameAPI["/mini-theater/id"], {
    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ query: { miniTheaterId }, game }) {
        const { result: miniTheater } = await services.data.gameData.miniTheaters.get(game.id, miniTheaterId)
        if (!miniTheater)
          return { status: HTTP_STATUS.not_found }
        return { status: HTTP_STATUS.ok, body: { miniTheater, type: 'found' }};
      }
    }
  });
  const miniTheaterActionRoutes = createAuthorizedResource(gameAPI["/mini-theater/action"], {
    POST: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ body: { action }, query: { miniTheaterId }, game, identity }) {
        const userId = identity.type === 'link' && identity.grant.identity;
        if (!userId)
          return { status: HTTP_STATUS.unauthorized };

        const isGM = game.gameMasterId === userId;
        const next = await services.game.miniTheater.applyAction(game.id, miniTheaterId, action, isGM);

        return { status: HTTP_STATUS.ok, body: { miniTheater: next, type: 'updated' }};
      }
    }
  });
  const terrainRoutes = createTerrainRoutes(services);

  const http = [
    ...miniTheaterRoutes,
    ...miniTheaterByIdRoutes,
    ...miniTheaterActionRoutes,
    ...terrainRoutes.http,
  ];
  const ws = [];
  return { http, ws };
}