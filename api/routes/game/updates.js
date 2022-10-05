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
      const connectionId = await services.game.connection.connect(gameId, identity.grant.identity, Date.now());
      send({ type: 'connected', connectionId });
      console.log('CONNECT', connectionId);

      const interval = setInterval(async () => {
        try {
          socket.ping(Date.now());
          // TODO: move game connection heartbeat into (core) update channel
          await services.game.connection.heartbeat(gameId, connectionId, Date.now())
          updateChannels.heartbeat();
        } catch (error) {
          console.error(error);
        }
      }, 1000)

      const updateChannels = services.update.create(game, identity.grant.identity, connectionId, send, identity);

      const { removeListener } = addRecieveListener(m => updateChannels.update(m));
  
      socket.addEventListener('close', () => {
        console.log('CLOSE');
        clearInterval(interval)
        removeListener();
        updateChannels.close();
        services.game.connection.disconnect(gameId, connectionId)
          .catch(console.error);
      });
    }
  })

  return {
    http: [],
    ws: [gameUpdates]
  }
}