// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createMetaRoutes, defaultOptions } from '../meta.js';
import { scenesAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';

export const createSceneRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const expositionRoutes = createAuthorizedResource(scenesAPI["/games/scenes/exposition"], {
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      async handler({ game, identity }) {
        const exposition = {
          id: uuid(),

          title: '',
          subject: { type: 'none' },
          tags: []
        };
        await services.data.gameData.scenes.expositions.set(game.id, exposition.id, { exposition })
        await services.data.gameUpdates.publish(game.id, { type: 'scenes' });

        return {
          status: HTTP_STATUS.created,
          body: { type: 'created', exposition }
        };
      }
    },
    GET: {
      scope: { type: 'guest' },
      getGameId: r => r.query.gameId,
      async handler({ game, identity }) {
        const { result } = await services.data.gameData.scenes.expositions.query(game.id);

        return { status: HTTP_STATUS.ok, body: { type: 'found', exposition: result.map(r => r.exposition) } };
      }
    }
  })

  const http = [
    ...expositionRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
