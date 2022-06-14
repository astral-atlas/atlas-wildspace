// @flow strict

/*::
import type { RoutesConstructor } from "../../routes";
*/
import { createMaskForMonsterActor, roomAPI } from "@astral-atlas/wildspace-models";
import { createMetaRoutes } from "../meta.js";
import { HTTP_STATUS } from "@lukekaalim/net-description";

export const createRoomPageRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const roomPageRoutes = createAuthorizedResource(roomAPI["/games/rooms/page"], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
      async handler({ game, query: { roomId } }) {
        const roomPage = await services.room.getRoomPage(game.id, roomId)
        if (!roomPage)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', roomPage } }
      }
    }
  })

  return {
    http: [
      ...roomPageRoutes,
    ],
    ws: [],
  };
};
