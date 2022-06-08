// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createMetaRoutes, defaultOptions } from '../meta.js';
import { locationAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';

export const createLocationsRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const locationRoutes = createAuthorizedResource(locationAPI["/games/location"], {
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      async handler({ game }) {
        const location = {
          id: uuid(),

          title: '',
          background: { type: 'color', color: 'red' },
          description: { type: 'plaintext', plaintext: '' },
          tags: []
        };
        await services.data.gameData.locations.set(game.id, location.id, location)
        await services.data.gameUpdates.publish(game.id, { type: 'locations' });

        return {
          status: HTTP_STATUS.created,
          body: { type: 'created', location }
        };
      }
    },
    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, identity }) {
        const { result: locations } = await services.data.gameData.locations.query(game.id);
        const relatedAssetIds = locations.map(r => {
          switch (r.background.type) {
            case 'image':
              return r.background.imageAssetId;
            default:
              return null
          }
        }).filter(Boolean);
        const relatedAssets = await Promise.all(relatedAssetIds.map(async id => [id, await services.asset.peek(id)]))

        return { status: HTTP_STATUS.ok, body: { type: 'found', location: locations, relatedAssets } };
      }
    },
    PUT: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, query, body: { location } }) {
        const nextLocation = {
          ...location,
          id: query.location,
        }
        await services.data.gameData.locations.set(game.id, nextLocation.id, nextLocation)
        await services.data.gameUpdates.publish(game.id, { type: 'locations' });

        return {
          status: HTTP_STATUS.ok,
          body: { type: 'updated' }
        };
      }
    },
    DELETE: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, query }) {
        await services.data.gameData.locations.set(game.id, query.location, null);
        await services.data.gameUpdates.publish(game.id, { type: 'locations' });

        return {
          status: HTTP_STATUS.ok,
          body: { type: 'deleted' }
        };
      }
    }
  })

  const http = [
    ...locationRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
