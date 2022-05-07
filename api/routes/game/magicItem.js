// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";

*/
import { createMetaRoutes } from "../meta.js";
import { magicItemAPI } from "@astral-atlas/wildspace-models";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from "uuid";

export const createMagicItemRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const magicItemRoutes = createAuthorizedResource(magicItemAPI["/games/magicItem"], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
      async handler({ game, identity }) {
        const { result: magicItem } = await services.data.gameData.magicItems.query(game.id);

        if (identity.type === 'link' && game.gameMasterId == identity.grant.identity)
          return { status: HTTP_STATUS.ok, body: { type: 'found', relatedAssets: [], magicItem }}

        const visibleMagicItems = magicItem.filter(m => m.visibility && m.visibility.type === 'players-in-game');
        return { status: HTTP_STATUS.ok, body: { type: 'found', relatedAssets: [], magicItem: visibleMagicItems }}
      }
    },
    POST: {
      getGameId: r => r.body.gameId,
      scope: { type: 'game-master-in-game' },
      async handler({ game }) {
        const magicItem = {
          id: uuid(),
          title: '',
          description: '',
          type: '',
          requiresAttunement: false,
          visibility: { type: 'game-master-in-game' },
          rarity: '',
        }
        await services.data.gameData.magicItems.set(game.id, magicItem.id, magicItem);
        await services.data.gameUpdates.publish(game.id, { type: 'magicItem' });

        return { status: HTTP_STATUS.ok, body: { type: 'created', magicItem }}
      }
    },
    PUT: {
      getGameId: r => r.query.gameId,
      scope: { type: 'game-master-in-game' },
      async handler({ game, body: { magicItem } }) {
        const { result: prevMagicItem } = await services.data.gameData.magicItems.get(game.id, magicItem.id);
        if (!prevMagicItem)
          return { status: HTTP_STATUS.not_found };

        const nextMagicItem = {
          ...magicItem,
          id: prevMagicItem.id,
        }
        await services.data.gameData.magicItems.set(game.id, magicItem.id, nextMagicItem);
        await services.data.gameUpdates.publish(game.id, { type: 'magicItem' });

        return { status: HTTP_STATUS.ok, body: { type: 'updated', nextMagicItem }}
      }
    },
    DELETE: {
      getGameId: r => r.query.gameId,
      scope: { type: 'game-master-in-game' },
      async handler({ game, query: { magicItem } }) {
        await services.data.gameData.magicItems.set(game.id, magicItem, null);
        await services.data.gameUpdates.publish(game.id, { type: 'magicItem' });

        return { status: HTTP_STATUS.ok, body: { type: 'deleted' }}
      }
    }
  })

  const http = [
    ...magicItemRoutes
  ];
  const ws = [];
  return { http, ws };
}