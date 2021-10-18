// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Encounter, EncounterID, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPServiceClient } from '../entry.js'; */
import { encountersAPI } from "@astral-atlas/wildspace-models";

/*::
export type EncounterClient = {
  create: (gameId: GameID, name: string) => Promise<Encounter>,
  update: (gameId: GameID, encounterId: EncounterID, encounter: Encounter) => Promise<void>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<Encounter>>,
  remove: (gameId: GameID, encounterId: EncounterID) => Promise<void>
};
*/

export const createEncounterClient = (service/*: HTTPServiceClient*/)/*: EncounterClient*/ => {
  const r = service.createResource(encountersAPI["/games/encounters"]);

  const create = async (gameId, name, playerId) => {
    const { body: { encounter } } = await r.POST({ body: { gameId, name, playerId } });

    return encounter;
  };
  const list = async (gameId) => {
    const { body: { encounters } } = await r.GET({ query: { gameId } });

    return encounters;
  };
  const update = async (gameId, encounterId, encounter) => {
    await r.PUT({ query: { gameId, encounterId }, body: { encounter } });
  };
  const remove = async (gameId, encounterId) => {
    await r.DELETE({ query: { gameId, encounterId } });
  }

  return { create, update, list, remove };
};