// @flow strict
/*::
import type { RoutesConstructor } from "../../routes.js";
*/
import { gameAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes } from '../meta.js';
import { v4 as uuid } from 'uuid';

export const createUpdatesRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameConnection } = createMetaRoutes(services)

  const gameUpdates = createGameConnection(gameAPI['/games/updates-advanced'], {
    getGameId: r => r.gameId,
    scope: { type: 'player-in-game' },

    async handler({ game, connection: { query: { gameId }, send, addRecieveListener }, socket, identity }) {

      const connectionId = uuid();
      send({ type: 'connected', connectionId });

      const interval = setInterval(() => {
        socket.ping(Date.now());
        services.game.connection.heartbeat(gameId, connectionId, Date.now())
        updateChannels.heartbeat();
      }, 1000)

      const updateChannels = services.update.create(game, identity.grant.identity, connectionId, send, identity);

      const { removeListener } = addRecieveListener(m => updateChannels.update(m));
  
      socket.addEventListener('close', () => {
        clearInterval(interval)
        removeListener();
        updateChannels.close();
        services.game.connection.disconnect(gameId, connectionId);
      });
    }
  })

  return {
    http: [],
    ws: [gameUpdates]
  }
}