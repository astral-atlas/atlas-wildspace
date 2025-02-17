// @flow strict
/*::
import type { RoutesConstructor } from "../routes.js";
*/
import { gameAPI, pageAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes } from './meta.js';
import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";

export const createPageRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services)

  const gamePageRoutes = createAuthorizedResource(pageAPI["/pages/game"], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
  
      async handler({ game, identity }) {
        const gamePage = await services.page.getGamePage(game.id, identity, identity.type === 'link' && identity.grant.identity === game.gameMasterId)
        if (!gamePage)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', gamePage } }
      }
    }
  })
  const roomPageRoutes = createAuthorizedResource(pageAPI["/pages/room"], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
  
      async handler({ game, query: { roomId } }) {
        const roomPage = await services.page.getRoomPage(game.id, roomId)
        if (!roomPage)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', roomPage } }
      }
    }
  })

  return {
    http: [...gamePageRoutes, ...roomPageRoutes],
    ws: []
  }
}