// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Character, CharacterID, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPServiceClient } from '../entry.js'; */
import { charactersAPI } from "@astral-atlas/wildspace-models";

/*::
export type CharacterClient = {
  create: (gameId: GameID, name: string, playerId: UserID) => Promise<Character>,
  update: (gameId: GameID, characterId: CharacterID, character: Character) => Promise<void>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<Character>>,
  remove: (gameId: GameID, characterId: CharacterID) => Promise<void>
};
*/

export const createCharacterClient = (service/*: HTTPServiceClient*/)/*: CharacterClient*/ => {
  const r = service.createResource(charactersAPI["/games/characters"]);

  const create = async (gameId, name, playerId) => {
    const { body: { character } } = await r.POST({ body: { gameId, name, playerId } });

    return character;
  };
  const list = async (gameId) => {
    const { body: { characters } } = await r.GET({ query: { gameId } });

    return characters;
  };
  const update = async (gameId, characterId, character) => {
    await r.PUT({ query: { gameId, characterId }, body: { character } });
  };
  const remove = async (gameId, characterId) => {
    await r.DELETE({ query: { gameId, characterId } });
  }

  return { create, update, list, remove };
};