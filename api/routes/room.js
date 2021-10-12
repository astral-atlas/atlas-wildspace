// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "../services.js"; */

import { v4 as uuid } from 'uuid';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes } from "@lukekaalim/http-server";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";

import { roomAPI } from '@astral-atlas/wildspace-models'; 
import { defaultOptions } from './meta.js';

export const createRoomRoutes = ({ data, ...s }/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {

  const { assertWithinScope: assertPlayer } = s.game.createScopeAssertion({ type: 'player-in-game' });
  const { assertWithinScope: assertGameMaster } = s.game.createScopeAssertion({ type: 'game-master-in-game' });

  const roomResourceRoutes = createJSONResourceRoutes(roomAPI['/room'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, roomId }, headers: { authorization } }) => {
      const identity = await s.auth.getAuthFromHeader(authorization);
      const { game } = await assertPlayer(gameId, identity);
      const { result: room } = await data.room.get(game.id, roomId);
      if (!room)
        return { status: HTTP_STATUS.not_found };
      return { status: HTTP_STATUS.ok, body: { type: 'found', room } };
    },
    POST: async ({ body: { title, gameId }, headers: { authorization } }) => {
      const identity = await s.auth.getAuthFromHeader(authorization);
      const { game } = await assertGameMaster(gameId, identity);
      
      const room = {
        id: uuid(),
        title,
        gameId,
      };

      await data.room.set(gameId, room.id, room);

      return { status: HTTP_STATUS.created, body: { type: 'created', room } };
    },
  });
  const allRoomsResourceRoute = createJSONResourceRoutes(roomAPI['/room/all'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: rooms } = await data.room.query(gameId);
      return { status: HTTP_STATUS.ok, body: { type: 'found', rooms } };
    },
  });
  const roomStateConnectionRoute = createJSONConnectionRoute(roomAPI['/room/state'].connection, (connection, socket) => {
    const { gameId, roomId } = connection.query;

    const onClientMessage = (message) => {
      // nothing!
    };
    connection.addRecieveListener(onClientMessage);
    const onRoomUpdate = async (update) => {
      const { result: state } = await data.roomState.get(gameId, roomId);
      connection.send({ type: 'update', state: state || { audio: null } })
    };

    const start = async () => {
      const { result: room } = await data.room.get(gameId, roomId)
      if (!room)
        return socket.close(1001, 'fuck you');
      const { result: state } = await data.roomState.get(gameId, roomId)
      connection.send({ type: 'update', state: state || { audio: null } });
      data.roomUpdates.subscribe(roomId, onRoomUpdate);
    };

    start();
  });
  const roomStateResourceRoutes = createJSONResourceRoutes(roomAPI['/room/state'].resource, {
    ...defaultOptions,
    GET: async ({ query: { roomId, gameId }, headers: { connection, upgrade } }) => {
      const { result: state } = await data.roomState.get(gameId, roomId);
      if (!state)
        return { status: HTTP_STATUS.created, body: { type: 'found', state: { audio: null } } };

      if (connection && upgrade && connection.toLocaleLowerCase() == 'upgrade' && upgrade.toLocaleLowerCase() == 'websocket')
        return { status: HTTP_STATUS.switching_protocols };

      return { status: HTTP_STATUS.ok, body: { type: 'found', state } };
    },
    PUT: async ({ query: { roomId, gameId }, body: { state: nextState }}) => {
      const { result: room } = await data.room.get(gameId, roomId);
      if (!room)
        return { status: HTTP_STATUS.not_found };
        
      await data.roomState.set(gameId, roomId, nextState);
      data.roomUpdates.publish(roomId);

      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    },
  });

  const http = [
    ...roomResourceRoutes,
    ...roomStateResourceRoutes,
    ...allRoomsResourceRoute,
  ];
  const ws = [
    roomStateConnectionRoute
  ];
  return { http, ws };
};