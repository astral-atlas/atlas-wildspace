// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "../services.js"; */

import { v4 as uuid } from 'uuid';
import { c } from "@lukekaalim/cast";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes, createResourceRoutes } from "@lukekaalim/http-server";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";

import { roomAPI } from '@astral-atlas/wildspace-models'; 
import * as m from '@astral-atlas/wildspace-models'; 
import { createMetaRoutes, defaultOptions } from './meta.js';

export const createRoomRoutes = ({ data, ...s }/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const { createAuthorizedResource } = createMetaRoutes({ ...s, data });

  const roomResourceRoutes = createAuthorizedResource(roomAPI['/room'], {
    ...defaultOptions,

    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }}) => {
        const { result: room } = await data.room.get(game.id, roomId);
        if (!room)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', room } };
      }
    },
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      handler: async ({ game, body: { title } }) => {
        const room = {
          id: uuid(),
          title,
          gameId: game.id,
        };
  
        await data.room.set(game.id, room.id, room);
        data.gameUpdates.publish(game.id, { type: 'rooms' })
  
        return { status: HTTP_STATUS.created, body: { type: 'created', room } };
      }
    },
    PUT: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }, body: { room } }) => {
        const { result: prevRoom } = await data.room.get(game.id, roomId);
        if (!prevRoom)
          return { status: HTTP_STATUS.not_found };
        const nextRoom = {
          ...room,
          id: prevRoom.id,
          gameId: prevRoom.gameId,
        };
        await data.room.set(game.id, room.id, nextRoom);
        data.gameUpdates.publish(game.id, { type: 'rooms' })
  
        return { status: HTTP_STATUS.created, body: { type: 'updated' } };
      }
    }
  });
  const allRoomsResourceRoute = createJSONResourceRoutes(roomAPI['/room/all'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: rooms } = await data.room.query(gameId);
      return { status: HTTP_STATUS.ok, body: { type: 'found', rooms } };
    }
  });

  const roomAudioRoutes = createJSONResourceRoutes(roomAPI['/room/audio'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, roomId }}) => {
      const { result: audio } = await data.roomAudio.get(gameId, roomId);
      return { status: HTTP_STATUS.ok, body: { type: 'found', audio } };
    },
    PUT: async ({ query: { gameId, roomId }, body: { audio }}) => {
      await data.roomAudio.set(gameId, roomId, audio || null);
      data.roomUpdates.publish(roomId, { type: 'audio', audio });
      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    }
  });
  const roomEncounterRoutes = createJSONResourceRoutes(roomAPI['/room/encounter'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, roomId }}) => {
      const { result: encounter } = await data.roomEncounter.get(gameId, roomId);
      return { status: HTTP_STATUS.ok, body: { type: 'found', encounter } };
    },
    PUT: async ({ query: { gameId, roomId }, body: { encounter }}) => {
      await data.roomEncounter.set(gameId, roomId, encounter || null);
      data.roomUpdates.publish(roomId, { type: 'encounter', encounter });
      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    }
  });
  /*
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
  */

  const roomUpdateResourceRoute = createJSONResourceRoutes({ path: '/room/updates', GET: { toQuery: c.obj({ gameId: m.castGameId, roomId: m.castRoomId }) }}, {
    ...defaultOptions,

    GET: async ({ query: { roomId, gameId } }) => {
      const { result: room } = await data.room.get(gameId, roomId);
      if (!room)
        return { status: HTTP_STATUS.not_found }
      return { status: HTTP_STATUS.switching_protocols };
    }
  });
  const roomUpdateConnectionRoute = createJSONConnectionRoute(roomAPI['/room/updates'], (con, socket) => {
    const { query: { roomId, gameId }} = con;
    const onUpdate = (update) => {
      con.send(update);
    };
    const s = data.roomUpdates.subscribe(roomId, onUpdate)
    socket.addEventListener('close', () => {
      s.unsubscribe();
    });
  });
  const http = [
    ...roomResourceRoutes,
    ...roomEncounterRoutes,
    ...roomAudioRoutes,
    ...roomUpdateResourceRoute,
    //...roomStateResourceRoutes,
    ...allRoomsResourceRoute,
  ];
  const ws = [
    roomUpdateConnectionRoute,
    //roomStateConnectionRoute
  ];
  return { http, ws };
};