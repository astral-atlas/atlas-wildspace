// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*::  */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
import { scenesAPI } from "@astral-atlas/wildspace-models";

/*::
import type {
  GameID,
  ExpositionScene,
} from '@astral-atlas/wildspace-models';

export type SceneClient = {
  list: (gameId: GameID) => Promise<$ReadOnlyArray<ExpositionScene>>,
  create: (gameId: GameID) => Promise<ExpositionScene>,
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

  return { list, create };
};