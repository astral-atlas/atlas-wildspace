// @flow strict
import { v4 as uuid } from 'uuid';
/*::
import type { GameID, RoomID, GameConnectionID, RoomConnectionState } from "@astral-atlas/wildspace-models";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { UserID } from "@astral-atlas/sesame-models";
import type {  } from "../../../models/room/room";

export type RoomConnectionService = {
  connect: (gameId: GameID, roomId: RoomID, gameConnectionId: GameConnectionID, userId: UserID) => Promise<void>,
  heartbeat: (gameId: GameID, roomId: RoomID, gameConnectionId: GameConnectionID) => Promise<void>,
  disconnect: (gameId: GameID, roomId: RoomID, gameConnectionId: GameConnectionID) => Promise<void>, 

  listRoom: (gameId: GameID, roomId: RoomID) => Promise<$ReadOnlyArray<RoomConnectionState>>,
  listAll: (gameId: GameID) => Promise<$ReadOnlyArray<RoomConnectionState>>,

  subscribeConnectionChange: (
    gameId: GameID,
    ({ connections: $ReadOnlyArray<RoomConnectionState>, counts: $ReadOnlyArray<{ roomId: RoomID, count: number }> }) => mixed
  ) =>{ unsubscribe: () => void },
}
*/
const CONNECTION_TIMEOUT_SECONDS = 60;

export const createRoomConnectionService = (data/*: WildspaceData*/)/*: RoomConnectionService*/ => {
  const connect = async (gameId, roomId, gameConnectionId, userId) => {
    const key = { partition: gameId, sort: [roomId, gameConnectionId] };

    const expiresBy = (Date.now() * 1000) + CONNECTION_TIMEOUT_SECONDS;
    const roomConnectionState = {
      gameConnectionId,
      roomId,
      userId,
      version: uuid(),
    };

    await data.roomData.roomConnections.set(key, null, roomConnectionState.version, expiresBy, roomConnectionState);
    publishConnectionUpdate(gameId);
  };

  const heartbeat = async (gameId, roomId, gameConnectionId) => {
    const key = { partition: gameId, sort: [roomId, gameConnectionId] };
    const { result: connection, version } = await data.roomData.roomConnections.get(key);
    if (!connection || !version)
      throw new Error();

    const expiresBy = (Date.now() * 1000) + CONNECTION_TIMEOUT_SECONDS;

    await data.roomData.roomConnections.set(key, version, uuid(), expiresBy, connection);
  };

  const disconnect = async (gameId, roomId, gameConnectionId) => {
    const key = { partition: gameId, sort: [roomId, gameConnectionId] };
    await data.roomData.roomConnections.remove(key);
    publishConnectionUpdate(gameId);
  }

  const listRoom = async (gameId, roomId) => {
    const { results } = await data.roomData.roomConnections.query(gameId);

    return results
      .filter(({ result }) => result.roomId === roomId)  
      .map(({ result }) => result);
  }
  const listAll = async (gameId) => {
    const { results } = await data.roomData.roomConnections.query(gameId);

    return results
      .map(({ result }) => result);
  }
  const subscribeConnectionChange = (gameId, subscriber) => {
    const { unsubscribe } = data.roomData.roomConnectionUpdates.subscribe(gameId, (update) => subscriber(update));
    return { unsubscribe };
  }

  const publishConnectionUpdate = async (gameId) => {
    const connections = await listAll(gameId);

    const counts = countRoomConnections(connections);

    await data.roomData.roomConnectionUpdates.publish(gameId, { connections, counts });
  }

  return {
    connect,
    heartbeat,
    disconnect,

    listRoom,
    listAll,

    subscribeConnectionChange,
  }
};

export const countRoomConnections = (connectionStates/*: $ReadOnlyArray<RoomConnectionState>*/)/*: { roomId: RoomID, count: number }[]*/ => {
  const countMap = new Map();
  for (const { roomId } of connectionStates) {
    const count = countMap.get(roomId) || 0;
    countMap.set(roomId, count + 1);
  }
  const counts = [...countMap.entries()]
    .map(([roomId, count]) => ({ roomId, count }));

  return counts;
}