// @flow strict

/*::
import type { GameID, GameConnectionID, GameConnectionState } from "@astral-atlas/wildspace-models";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { UserID } from "@astral-atlas/sesame-models";

export type GameConnectionService = {
  heartbeat: (gameId: GameID, connectionId: GameConnectionID, userId: UserID, now: number) => Promise<void>, 
  disconnect: (gameId: GameID, connectionId: GameConnectionID) => Promise<void>, 
  getValidConnections: (gameId: GameID, now: number) => Promise<$ReadOnlyArray<GameConnectionState>>, 
}
*/
const CONNECTION_TIMEOUT = 4000;

export const createGameConnectionService = (data/*: WildspaceData*/)/*: GameConnectionService*/ => {

  const heartbeat = async (gameId, connectionId, userId, now) => {
    await data.gameData.connections.set(gameId, connectionId, { id: connectionId, userId, heartbeat: now });
  };
  const disconnect = async (gameId, connectionId) => {
    await data.gameData.connections.set(gameId, connectionId, null);
  }
  const getValidConnections = async (gameId, now) => {
    const { result: connections } = await data.gameData.connections.query(gameId);

    const validConnections = connections
      .filter(c => c.heartbeat >= (now - CONNECTION_TIMEOUT));
      
    await Promise.all(connections.map(c => {
      if (validConnections.find(vc => vc.id === c.id))
        return;
      
      return data.gameData.connections.set(gameId, c.id, null);
    }))

    return validConnections;
  }

  return {
    heartbeat,
    getValidConnections,
    disconnect,
  }
};
