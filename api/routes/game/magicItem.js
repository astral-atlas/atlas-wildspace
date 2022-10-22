// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";

*/
import { createMetaRoutes, createCRUDConstructors } from "../meta.js";
import { magicItemAPI } from "@astral-atlas/wildspace-models";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from "uuid";

export const createMagicItemRoutes/*: RoutesConstructor*/ = (services) => {
  const { createAuthorizedResource } = createMetaRoutes(services);
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const magicItemRoutes = createGameCRUDRoutes(magicItemAPI["/games/magicItem"], {
    idName: 'magicItemId',
    name: 'magicItem',
    gameDataKey: 'magicItem',
    gameUpdateType: 'magicItem',
    async create({ game, body: { magicItem: { title } } }) {
      const magicItem = {
        id: uuid(),
        title,
        description: '',
        type: '',
        requiresAttunement: false,
        visibility: { type: 'game-master-in-game' },
        rarity: '',
      }
      await services.data.gameData.magicItems.set(game.id, magicItem.id, magicItem);
      return magicItem;
    },
    async update({ game, body: { magicItem }, query: { magicItemId } }) {
      await services.data.gameData.magicItems.set(game.id, magicItemId, { ...magicItem, id: magicItemId });
      return magicItem;
    },
    async destroy({ game, query: { magicItemId }}) {
      await services.data.gameData.magicItems.set(game.id, magicItemId, null);
    },
    async read({ game, identity }) {
      const { result } = await services.data.gameData.magicItems.query(game.id);
      if (identity.type === 'link' && identity.grant.identity === game.gameMasterId)
        return result;
      return result
        .filter(m => m.visibility && m.visibility.type === 'players-in-game')
    },
  });

  const http = [
    ...magicItemRoutes
  ];
  const ws = [];
  return { http, ws };
}