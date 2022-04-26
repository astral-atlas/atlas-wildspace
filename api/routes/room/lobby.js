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

const isValidContentForIdentity = (content, identity, characters) => {
  return true;
/*
  if (identity.type === 'guest')
    return false;
  switch (content.type) {
    case 'character':
      const character = characters.find(c => c.id === content.characterId);
      if (!character)
        return false;
      return character.playerId === identity.grant.identity;
    case 'user':
      return content.userId === identity.grant.identity;
  }
  */
}

export const createLobbyRoutes/*: RoutesConstructor*/ = (services) => {
  const { createRoomResource } = createMetaRoutes(services);

  const lobbyMessageRoutes = createRoomResource(roomAPI["/room/lobby/message"], {
    POST: {
      getGameId: r => r.query.gameId,
      getRoomId: r => r.query.roomId,
      scope: { type: 'player-in-game' },
      async handler({ game, room, body: { content }, identity }) {

        if (!isValidContentForIdentity(content, identity))
          return { status: HTTP_STATUS.forbidden };

        const { result: loadedLobby } = await services.data.roomData.lobby.get(game.id, room.id)
        const prevLobby = loadedLobby || { messages: [], playersConnected: [] };
        const message = { id: v4(), timePosted: Date.now(), content };
        const maxMessages = 50;
        const nextLobby = {
          ...prevLobby,
          messages: [
            ...prevLobby.messages,
            message
          ].slice(-maxMessages)
        }
        const lobbyEvent = {
          type: 'append-messages',
          messages: [message]
        }
        await services.data.roomData.lobby.set(game.id, room.id, nextLobby);
        await services.data.roomData.updates.publish(room.id, { type: 'lobby-event', lobbyEvent });
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