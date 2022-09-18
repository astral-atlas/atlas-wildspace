// @flow strict
/*::
import type { RoutesConstructor } from "../../../routes";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createCRUDConstructors } from "../../meta.js";
import { v4 as uuid } from "uuid";

export const createTerrainRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const terrainPropRoutes = createGameCRUDRoutes(gameAPI["/games/mini-theater/terrain-prop"], {
    name: 'terrainProp',
    idName: 'terrainPropId',
    gameDataKey: 'mini-theater/terrain-prop',
    readScope: { type: 'game-master-in-game' },
    async create({ game, body: { terrainProp: { iconPreviewCameraModelPath, modelPath, modelResourceId, name } } }) {
      const terrainPropId = uuid();
      const terrainProp = {
        id: terrainPropId,
        modelResourceId,
        name,
        modelPath,
        iconPreviewCameraModelPath,
      };
      await services.data.gameData.miniTheater.terrainProps.set({ partition: game.id, sort: terrainPropId }, null, null, null, terrainProp);
      return terrainProp;
    },
    async read({ game }) {
      const { results: models } = await services.data.gameData.miniTheater.terrainProps.query(game.id);
      return models.map(m => m.result);
    },
    async update({ game, query: { terrainPropId }, body: { terrainProp: { name } } }) {
      const { result: terrainProp } = await services.data.gameData.miniTheater.terrainProps.get({ partition: game.id, sort: terrainPropId });
      if (!terrainProp)
        throw new Error();
      const nextTerrainProp = {
        ...terrainProp,
        name,
      }

      await services.data.gameData.miniTheater.terrainProps.set({ partition: game.id, sort: terrainPropId }, null, null, null, nextTerrainProp);
      return nextTerrainProp;
    },
    async destroy({ game, query: { terrainPropId } }) {
      await services.data.gameData.miniTheater.terrainProps.remove({ partition: game.id, sort: terrainPropId });
    }
  });

  const http = [
    ...terrainPropRoutes,
  ];
  const ws = [

  ];
  return { http, ws }
}