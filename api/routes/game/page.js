// @flow strict
/*::
import type { RoutesConstructor } from "../../routes.js";
*/
import { gameAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes } from '../meta.js';
import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";

export const createGamePageRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services)

  const gamePageRoutes = createAuthorizedResource(gameAPI['/games/page'], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
  
      async handler({ game }) {
        const gamePage = await services.game.getGamePage(game.id)
        if (!gamePage)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', gamePage } }
      }
    }
  })

  return {
    http: [...gamePageRoutes],
    ws: []
  }
}