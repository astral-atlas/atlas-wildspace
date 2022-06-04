// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createCRUDConstructors, defaultOptions } from '../meta.js';
import { scenesAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';

export const createSceneRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes} = createCRUDConstructors(services);

  const scenesRoutes = createGameCRUDRoutes(scenesAPI["/games/scenes"], {
    name: 'scene',
    idName: 'sceneId',
    gameUpdateType: 'scenes',
    async create({ game, body: { scene: { title }} }) {
      const scene = {
        id: uuid(),

        title,
        content: { type: 'none' },
        
        overrides: null,
        tags: []
      };
      await services.data.gameData.scenes.set(game.id, scene.id, scene)
      return scene;
    },
    async update({ game, query: { sceneId }, body: { scene }}) {
      const nextScene = {
        ...scene,
        sceneId,
      }
      await services.data.gameData.scenes.set(game.id, sceneId, nextScene);
      return nextScene;
    },
    async read({ game }) {
      const { result } = await services.data.gameData.scenes.query(game.id);
      return result;
    },
    async destroy({ game, query: { sceneId }}) {
      await services.data.gameData.scenes.set(game.id, sceneId, null);
    },
  })

  const http = [
    ...scenesRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
