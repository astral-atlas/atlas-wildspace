// @flow strict
/*::
import type { HTTPServiceClient } from '../wildspace.js';
import type { GameID, MagicItem, MagicItemID } from "@astral-atlas/wildspace-models";
*/

import { magicItemAPI } from "@astral-atlas/wildspace-models";

/*::

export type MagicItemClient = {
  create: (gameId: GameID) => Promise<MagicItem>,
  update: (gameId: GameID, magicItemId: MagicItemID, next: MagicItem) => Promise<void>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<MagicItem>>,
  destroy: (gameId: GameID, magicItemId: MagicItemID) => Promise<void>,
}
*/

export const createMagicItemClient = (http/*: HTTPServiceClient*/)/*: MagicItemClient*/ => {
  const magicItemResource = http.createResource(magicItemAPI['/games/magicItem']);

  const create = async (gameId) => {
    const { body: { magicItem }} = await magicItemResource.POST({ body: { gameId }})
    return magicItem;
  };
  const update = async (gameId, magicItemId, nextMagicItem) =>  {
    await magicItemResource.PUT({ query: { gameId, magicItem: magicItemId }, body: { magicItem: nextMagicItem }})
  };
  const list = async (gameId) => {
    const { body: { magicItem }} = await magicItemResource.GET({ query: { gameId }})
    return magicItem;
  };
  const destroy = async (gameId, magicItemId) => {
    await magicItemResource.DELETE({ query: { gameId, magicItem: magicItemId }})
  };

  return { create, update, list, destroy }
}