// @flow strict

/*::
import type { RoutesConstructor } from "../../routes";
*/
import { createMaskForMonsterActor, roomAPI } from "@astral-atlas/wildspace-models";
import { createMetaRoutes } from "../meta.js";
import { HTTP_STATUS } from "@lukekaalim/net-description";


export const createRoomPageRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  createAuthorizedResource(roomAPI["/games/rooms/page"], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
      async handler({ game, query: { roomId } }) {
        const [
          { result: room },
          { result: sceneState },
          { result: monsters },
          { result: monsterActors }
        ] = await Promise.all([
          services.data.room.get(game.id, roomId),
          services.data.roomData.scene.get(game.id, roomId),
          services.data.monsters.query(game.id),
          services.data.gameData.monsterActors.query(game.id),
        ]);
        if (!room)
          return { status: HTTP_STATUS.not_found };

        const state = {
          scene: sceneState || { activeScene: null },
        }

        const monsterMap = new Map(monsters.map(m => [m.id, m]));

        const monsterMasks = monsterActors.map(actor => {
          const monster = monsterMap.get(actor.monsterId);
          if (!monster)
            return null;
          return createMaskForMonsterActor(monster, actor);
        }).filter(Boolean);

        const roomPage = {
          room,
          state,

          monsterMasks,
          
          scene,
          locations,
          expositions,

          playlist,
          tracks,

          assets,
        };
        return { status: HTTP_STATUS.ok, body: { type: 'found', roomPage } }
      }
    }
  })

  return {
    http: [],
    ws: [],
  };
};
