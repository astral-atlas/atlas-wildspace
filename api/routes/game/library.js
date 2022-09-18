// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";

*/
import { createMetaRoutes, createCRUDConstructors } from "../meta.js";
import { gameAPI, isMiniTheaterActionAuthorized, reduceMiniTheaterAction } from "@astral-atlas/wildspace-models";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from "uuid";

export const createLibraryRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const libraryRoutes = createAuthorizedResource(gameAPI["/games/library"], {
    GET: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game }) {
        const library = await services.page.library.getLibraryData(game.id);
        return { status: HTTP_STATUS.ok, body: { type: 'found', library } }
      }
    }
  })


  const http = [
    ...libraryRoutes,
  ];
  const ws = [];
  return { http, ws };
}