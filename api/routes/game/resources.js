// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createCRUDConstructors, createMetaRoutes } from "../meta.js";
import { v4 as uuid } from "uuid";

export const createResourcesRoutes/*: RoutesConstructor*/ = (services) => {
  const {
    createDynamoDBGameResourceRoute,
    createGameResourceRoutes
  } = createMetaRoutes(services);
  const {
    createGameCRUDRoutes,
  } = createCRUDConstructors(services);

  

  const modelsRoutes = createGameCRUDRoutes(gameAPI["/games/resources/models"], {
    name: 'model',
    idName: 'modelId',
    gameDataKey: 'resource/model',
    readScope: { type: 'game-master-in-game' },
    async create({ game, body: { model: { assetId, format, name, previewCameraPath } } }) {
      const modelId = uuid();
      const model = {
        id: modelId,
        assetId,
        name,
        format,
        previewCameraPath,
        tags: [],
        title: name,
        gameId: game.id,
        visibility: { type: 'game-master-in-game' },
        version: uuid(),
      };
      await services.data.gameData.resources.models.set({ partition: game.id, sort: modelId }, null, null, null, model);
      return model;
    },
    async read({ game }) {
      const { results: models } = await services.data.gameData.resources.models.query(game.id);
      return models.map(m => m.result);
    },
    async update({ game, query: { modelId }, body: { model: { name, previewCameraPath } } }) {
      const { result: model } = await services.data.gameData.resources.models.get({ partition: game.id, sort: modelId });
      if (!model)
        throw new Error();
      const nextModel = {
        ...model,
        name,
        previewCameraPath,
      }

      await services.data.gameData.resources.models.set({ partition: game.id, sort: modelId }, null, null, null, nextModel);
      return nextModel;
    },
    async destroy({ game, query: { modelId } }) {
      await services.data.gameData.resources.models.remove({ partition: game.id, sort: modelId });
    }
  });

  const http = [
    ...modelsRoutes,
  ];
  const ws = [

  ];
  return { http, ws }
}