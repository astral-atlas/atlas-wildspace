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
        const [
          { result: characters },
          { result: monsters },
          { result: monsterActors },
          { result: miniTheaters },
          { result: expositions },
          { result: scenes },
          { result: locations },
        ] = await Promise.all([
          services.data.characters.query(game.id),
          services.data.monsters.query(game.id),
          services.data.gameData.monsterActors.query(game.id),
          services.data.gameData.miniTheaters.query(game.id),
          services.data.gameData.expositions.query(game.id),
          services.data.gameData.scenes.query(game.id),
          services.data.gameData.locations.query(game.id),
        ])
        const library = {
          characters,
          expositions,
          monsters,
          monsterActors,
          miniTheaters,
          scenes,
          locations,
        };
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