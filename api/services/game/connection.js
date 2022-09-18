// @flow strict
import { v4 as uuid } from 'uuid';
/*::
import type { GameID, GameConnectionID, GameConnectionState } from "@astral-atlas/wildspace-models";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { UserID } from "@astral-atlas/sesame-models";

export type GameConnectionService = {
  heartbeat: (gameId: GameID, connectionId: GameConnectionID, unixNow: number) => Promise<void>, 
  connect: (gameId: GameID, userId: UserID, unixNow: number) => Promise<GameConnectionID>,
  disconnect: (gameId: GameID, connectionId: GameConnectionID) => Promise<void>, 
  list: (gameId: GameID) => Promise<$ReadOnlyArray<GameConnectionState>>, 
}
*/
const CONNECTION_TIMEOUT_SECONDS = 60;

export const createGameConnectionService = (data/*: WildspaceData*/)/*: GameConnectionService*/ => {
  const connect = async (gameId, userId, unixNow) => {
    const gameConnectionId = uuid();
    const key = { partition: gameId, sort: gameConnectionId };
    const connection = {
      id: gameConnectionId,
      userId,
      gameId,
      heartbeat: unixNow,
    }
    const expiresBy = unixNow + CONNECTION_TIMEOUT_SECONDS;

    await data.gameData.connections.set(key, null, null, expiresBy, connection);
    return gameConnectionId;
  };

  const heartbeat = async (gameId, connectionId, unixNow) => {
    const key = { partition: gameId, sort: connectionId };
    const { result: connection } = await data.gameData.connections.get(key);
    if (!connection)
      throw new Error();

    const expiresBy = unixNow + CONNECTION_TIMEOUT_SECONDS;
    const nextConnection = {
      ...connection,
      heartbeat: unixNow,
    };

    await data.gameData.connections.set({ partition: gameId, sort: connectionId }, null, null, expiresBy, nextConnection);
  };

  const disconnect = async (gameId, connectionId) => {
    await data.gameData.connections.remove({ partition: gameId, sort: connectionId });
  }

  const list = async (gameId) => {
    const { results } = await data.gameData.connections.query(gameId);

    return results.map(r => r.result);
  }

  return {
    connect,
    heartbeat,
    list,
    disconnect,
  }
};
