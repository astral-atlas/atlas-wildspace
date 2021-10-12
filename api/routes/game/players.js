// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */
/*:: import type { PlayersAPI } from "@astral-atlas/wildspace-models"; */

import { HTTP_STATUS } from "@lukekaalim/net-description";
import { playersAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes, defaultOptions } from '../meta.js';
import { v4 as uuid } from 'uuid';

export const createPlayersRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const playersRoutes = createAuthorizedResource(playersAPI['/games/players'], {
    ...defaultOptions,
    
    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, identity }) {
        const players = await services.game.listPlayers(game.id, identity);
        return { status: HTTP_STATUS.ok, body: { type: 'found', players } };
      }
    },
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      async handler({ game, body: { playerId }, identity }) {
        await services.game.addPlayer(game.id, playerId, identity);
        return { status: HTTP_STATUS.created, body: { type: 'joined' } };
      } 
    },
    DELETE: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ query: { playerId }, game, identity }) {
        await services.game.removePlayer(game.id, playerId, identity);
        return { status: HTTP_STATUS.ok, body: { type: 'removed' } };
      }
    }
  });

  const ws = [

  ];
  const http = [
    ...playersRoutes,
  ];
  return { ws, http };
};
