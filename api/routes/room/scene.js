// @flow strict
/*::
import type { Route as HTTPRoute } from "@lukekaalim/http-server";
import type { WebSocketRoute } from "@lukekaalim/ws-server";
import type { WildspaceData } from "@astral-atlas/wildspace-data";

import type { GameIdentityScope } from "../../services/game.js";
import type { Services } from "../../services.js";
import type { RoutesConstructor } from '../../routes.js';
*/

import { HTTP_STATUS } from "@lukekaalim/net-description";
import { roomAPI } from "@astral-atlas/wildspace-models";
import { v4 as uuid, v4 } from 'uuid'

import { createMetaRoutes } from "../meta.js";

export const createRoomSceneRoutes/*: RoutesConstructor*/ = (services) => {
  const { createRoomResource } = createMetaRoutes(services);

  const lobbyMessageRoutes = createRoomResource(roomAPI["/room/scene/ref"], {
    POST: {
      getGameId: r => r.query.gameId,
      getRoomId: r => r.query.roomId,
      scope: { type: 'game-master-in-game' },
      async handler({ game, room, body: { activeScene } }) {
        const { result: sceneState } = await services.data.roomData.scene.get(game.id, room.id)
        const prevSceneState = sceneState || { activeScene: null };
        
        const nextSceneState = {
          ...prevSceneState,
          activeScene
        }

        await services.data.roomData.scene.set(game.id, room.id, nextSceneState);
        await services.data.roomData.updates.publish(room.id, { type: 'scene', scene: nextSceneState } )

        return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
      }
    }
  })

  const http = [
    ...lobbyMessageRoutes,
  ];
  const ws = [];
  return { http, ws };
};