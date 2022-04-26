// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*::  */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
import { scenesAPI } from "@astral-atlas/wildspace-models";

/*::
import type {
  GameID,
  ExpositionScene, ExpositionSceneID,
} from '@astral-atlas/wildspace-models';

export type SceneClient = {
  list: (gameId: GameID) => Promise<$ReadOnlyArray<ExpositionScene>>,
  update: (gameId: GameID, scene: ExpositionScene) => Promise<void>,
  create: (gameId: GameID) => Promise<ExpositionScene>,
  destroy: (gameId: GameID, scene: ExpositionSceneID) => Promise<void>,
};
*/

export const createSceneClient = (service/*: HTTPServiceClient*/)/*: SceneClient*/ => {
  const expositionResource = service.createResource(scenesAPI["/games/scenes/exposition"]);

  const list = async (gameId) => {
    const { body: { exposition } } = await expositionResource.GET({ query: { gameId } });
    return exposition;
  };
  const create = async (gameId) => {
    const { body: { exposition } } = await expositionResource.POST({ body: { gameId } });
    return exposition;
  }
  const update = async (gameId, scene) => {
    await expositionResource.PUT({ query: { gameId, exposition: scene.id }, body: { exposition: scene } });
  }
  const destroy = async (gameId, exposition) => {
    await expositionResource.DELETE({ query: { gameId, exposition }});
  }

  return { list, create, update, destroy };
};