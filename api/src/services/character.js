// @flow strict
/*:: import type { CharacterID, Character, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { MemoryStore } from './store'; */

/*::
type CharacterService = {
  getCharactersByGame: (gameId: GameID) => Promise<Character[]>,
};

export type {
  CharacterService,
};
*/

const createCharacterService = (store/*: MemoryStore<CharacterID, Character>*/)/*: CharacterService*/ => {
  const getCharactersByGame = async (gameId) => {
    return [...store.values]
      .map(([, character]) => character)
      .filter(character => character.game === gameId);
  };
  return {
    getCharactersByGame,
  }
};

module.exports = {
  createCharacterService,
};