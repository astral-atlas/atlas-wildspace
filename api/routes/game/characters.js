// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */
/*:: import type { GameAPI } from "@astral-atlas/wildspace-models"; */

import { HTTP_STATUS } from "@lukekaalim/net-description";
import { gameAPI } from '@astral-atlas/wildspace-models';
import { createMetaRoutes, defaultOptions } from '../meta.js';
import { v4 as uuid } from 'uuid';

export const createCharacterRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const characterRoutes = createAuthorizedResource(gameAPI['/games/characters'], {
    ...defaultOptions,
    
    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game }) {
        const { result: characters } = await services.data.characters.query(game.id);
        return { status: HTTP_STATUS.ok, body: { type: 'found', characters } };
      }
    },
    POST: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.body.gameId,
      async handler({ game, body: { name, playerId }, identity }) {
        if (identity.type === 'link' && identity.grant.identity !== playerId) {
          if (game.gameMasterId !== identity.grant.identity)
            throw new Error(`You cannot make another player a character unless you are the DM`);
        }
        const newCharacter = {
          id: uuid(),
          name,
          playerId,
          armorClass: 0,
          conditions: [],
          gameId: game.id,
          hitPoints: 0,
          iconURL: '',
          shortDescription: ''
        };

        await services.data.characters.set(game.id, newCharacter.id, newCharacter);
        services.data.gameUpdates.publish(game.id, { type: 'characters' });
        return { status: HTTP_STATUS.created, body: { type: 'created', character: newCharacter } };
      }
    },
    PUT: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ query: { characterId }, game, identity, body: { character } }) {
        const { result: prevCharacter } = await services.data.characters.get(game.id, characterId);
        if (!prevCharacter)
          throw new Error();

        if (identity.type === 'link' && identity.grant.identity !== prevCharacter.playerId) {
          if (game.gameMasterId !== identity.grant.identity)
            throw new Error(`You cannot update another player's character unless you are the DM`);
        }

        const nextCharacter = {
          ...character,
          id: prevCharacter.id,
          gameId: prevCharacter.gameId,
          playerId: prevCharacter.playerId,
        };

        await services.data.characters.set(game.id, nextCharacter.id, nextCharacter);
        services.data.gameUpdates.publish(game.id, { type: 'characters' });
        return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
      }
    },
    DELETE: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, query: { characterId }, identity }) {
        const { result: character } = await services.data.characters.get(game.id, characterId);
        if (!character)
          throw new Error();

        if (identity.type === 'link' && identity.grant.identity !== character.playerId) {
          if (game.gameMasterId !== identity.grant.identity)
            throw new Error(`You cannot delete another player's character unless you are the DM`);
        }
        await services.data.characters.set(game.id, character.id, null);
        services.data.gameUpdates.publish(game.id, { type: 'characters' });
        return { status: HTTP_STATUS.ok, body: { type: 'deleted' } };
      }
    },
  });

  const ws = [

  ];
  const http = [
    ...characterRoutes,
  ];
  return { ws, http };
};
