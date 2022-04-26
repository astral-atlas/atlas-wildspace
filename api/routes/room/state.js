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
import { createMetaRoutes } from "../meta.js";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";
import { v4 as uuid } from "uuid";


export const createStateRoutes/*: RoutesConstructor*/ = (services) => {
  const { createRoomResource, createGameConnection } = createMetaRoutes(services)

  const stateRoutes = createRoomResource(roomAPI["/room/state/v2"].resource, {
    GET: {
      getGameId: r => r.query.gameId,
      getRoomId: r => r.query.roomId,
      scope: { type: 'player-in-game' },
      async handler({ game, room }) {
        const { result: lobby } = await services.data.roomData.lobby.get(game.id, room.id);
        const { result: scene } = await services.data.roomData.scene.get(game.id, room.id);
        const { result: audio } = await services.data.roomAudio.get(game.id, room.id);

        const state = {
          roomId: room.id,
          audio: audio || {
            volume: 0,
            playback: { type: 'none' }
          },
          lobby: lobby || {
            playersConnected: [],
            messages: [],
          },
          scene: scene || {
            activeScene: null,
          }
        };
        return { status: HTTP_STATUS.ok, body: { type: 'found', state } }
      }
    }
  })

  const stateConnectionV2 = createGameConnection(roomAPI["/room/state/v2"].connection, {
    getGameId: q => q.gameId,
    scope: { type: 'player-in-game' },
    async handler({ game, connection, identity, socket }) {
      console.log(`Connected to ${identity.grant.identity}`)

    const { gameId, roomId } = connection.query;

    const heartbeatDuration = 1000 * 60;

    const init = async () => {
      const { result: room } = await services.data.room.get(gameId, roomId);
      if (!room)
        return socket.close(1000, 'No room!');
        
      const roomSubscription = services.data.roomData.updates.subscribe(roomId, update => {
        connection.send(update);
      });
      const legacyRoomSubscription = services.data.roomUpdates.subscribe(roomId, update => {
        connection.send(update);
      })
      const gameSubscrpition = services.data.gameUpdates.subscribe(gameId, update => {
        connection.send({ type: 'game', game: update });
      })

      const connetionStartTime = Date.now();
      const lobbyConnection = {
        id: uuid(),
        userId: identity.grant.identity,
        lastHeartbeat: connetionStartTime
      }

      const { result: lobby } = await services.data.roomData.lobby.get(gameId, roomId);
      const prevLobby = lobby || { messages: [], playersConnected: [] };
      const playersConnected = [...prevLobby.playersConnected, lobbyConnection]
        .filter(c => c.lastHeartbeat > (connetionStartTime - heartbeatDuration))

      const nextLobby = {
        ...prevLobby,
        playersConnected,
      };
      await services.data.roomData.lobby.set(gameId, roomId, nextLobby);
      await services.data.roomData.updates.publish(roomId, { type: 'lobby-event', lobbyEvent: { type: 'connection', playersConnected } })
      
      const heartbeatInterval = setInterval(async () => {
        const heartbeatTime = Date.now();
        const nextLobbyConnection = {
          ...lobbyConnection,
          lastHeartbeat: heartbeatTime
        }

        const { result: lobby } = await services.data.roomData.lobby.get(gameId, roomId);
        const prevLobby = lobby || { messages: [], playersConnected: [] };
        const playersConnected = [...prevLobby.playersConnected, nextLobbyConnection]
          .filter(c => c.lastHeartbeat > (heartbeatTime - heartbeatDuration))

        const nextLobby = {
          ...prevLobby,
          playersConnected,
        };
        await services.data.roomData.lobby.set(gameId, roomId, nextLobby);
      }, heartbeatDuration / 2)

      socket.addEventListener('close', () => void (async () => {
        console.log('Closing Connection');
        const heartbeatTime = Date.now();
        roomSubscription.unsubscribe();
        gameSubscrpition.unsubscribe();
        legacyRoomSubscription.unsubscribe();
        clearInterval(heartbeatInterval);

        const { result: lobby } = await services.data.roomData.lobby.get(gameId, roomId);
        const prevLobby = lobby || { messages: [], playersConnected: [] };
        const playersConnected = prevLobby.playersConnected
          .filter(c => c.id !== lobbyConnection.id)
          .filter(c => c.lastHeartbeat > (heartbeatTime - heartbeatDuration))
        const nextLobby = {
          ...prevLobby,
          playersConnected,
        };
        await services.data.roomData.lobby.set(gameId, roomId, nextLobby);
        await services.data.roomData.updates.publish(roomId, { type: 'lobby-event', lobbyEvent: { type: 'connection', playersConnected } })
      })())
    };
    init();
    }
  });

  const http = [
    ...stateRoutes,
  ];
  const ws = [
    stateConnectionV2
  ];

  return { http, ws }; 
}