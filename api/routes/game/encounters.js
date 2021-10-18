// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */
/*:: import type { PlayersAPI } from "@astral-atlas/wildspace-models"; */

import { HTTP_STATUS } from "@lukekaalim/net-description";
import { gameAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes, defaultOptions } from '../meta.js';
import { v4 as uuid } from 'uuid';

export const createEncounterRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const playersRoutes = createAuthorizedResource(gameAPI['/games/encounters'], {
    ...defaultOptions,
    
    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, identity }) {
        const { result: encounters } = await services.data.encounters.query(game.id);
        if (identity.type === 'link' && identity.grant.identity === game.gameMasterId)
          return { status: HTTP_STATUS.ok, body: { type: 'found', encounters } };

        const visibleEncounters = encounters.filter(encounter => encounter.visibility === 'players');
        return { status: HTTP_STATUS.ok, body: { type: 'found', encounters: visibleEncounters } };
      }
    },
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      async handler({ game, body: { name }, identity }) {
        const newEncounter = {
          id: uuid(),
          gameId: game.id,
          name,
          visibility: 'game-master',

          characters: [],
        };
        await services.data.encounters.set(game.id, newEncounter.id, newEncounter);
        services.data.gameUpdates.publish(game.id, { type: 'encounters' });
        return { status: HTTP_STATUS.created, body: { type: 'created', encounter: newEncounter } };
      } 
    },
    PUT: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ query: { encounterId }, game, body: { encounter }, identity }) {
        const { result: prevEncounter } = await services.data.encounters.get(game.id, encounterId);
        if (!prevEncounter)
          return { status: HTTP_STATUS.not_found };

        const updatedEncounter = {
          ...encounter,
          id: prevEncounter.id,
          gameId: prevEncounter.gameId,
        };
        await services.data.encounters.set(game.id, updatedEncounter.id, updatedEncounter);
        services.data.gameUpdates.publish(game.id, { type: 'encounters' });
        return { status: HTTP_STATUS.created, body: { type: 'updated' } };
      } 
    },
    DELETE: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ query: { encounterId }, game, identity }) {
        await services.data.encounters.set(game.id, encounterId, null);
        services.data.gameUpdates.publish(game.id, { type: 'encounters' });
        return { status: HTTP_STATUS.ok, body: { type: 'deleted' } };
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
