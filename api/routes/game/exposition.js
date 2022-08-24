// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createCRUDConstructors, defaultOptions } from '../meta.js';
import { emptyRootNode, gameAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';

export const createExpositionRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes} = createCRUDConstructors(services);

  const expositionRoutes = createGameCRUDRoutes(gameAPI["/games/exposition"], {
    name: 'exposition',
    idName: 'expositionId',
    gameUpdateType: 'exposition',
    async create({ game, body: { exposition: { name }} }) {
      const exposition = {
        id: uuid(),

        description: { rootNode: emptyRootNode, version: 0 },
        subjects: [],
        name,
      };
      await services.data.gameData.expositions.set(game.id, exposition.id, exposition)
      return exposition;
    },
    async read({ game }) {
      const { result } = await services.data.gameData.expositions.query(game.id);
      return result;
    },
    async update({ game, query: { expositionId }, body: { exposition }}) {
      const nextExposition = {
        ...exposition,
        id: expositionId,
      }
      await services.data.gameData.expositions.set(game.id, expositionId, nextExposition);
      return nextExposition;
    },
    async destroy({ game, query: { expositionId }}) {
      await services.data.gameData.expositions.set(game.id, expositionId, null);
    },
  })

  const http = [
    ...expositionRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
