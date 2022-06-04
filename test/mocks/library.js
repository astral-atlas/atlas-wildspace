// @flow strict
/*::
import type { LibraryData } from "@astral-atlas/wildspace-models";
*/

import { createMockMonster, createMockMonsterActor } from "./game";
import { createMockCharacter } from "./game.js";
import { createMockMiniTheater, createMockMonsterPiece } from "./miniTheater";
import { createMockCharacterPiece } from "./miniTheater.js";
import { randomElement, randomIntRange, randomSlice } from "./random";
import { repeat } from "./random.js";

export const createMockLibraryData = ()/*: LibraryData*/ => {
  const characters = repeat(createMockCharacter, randomIntRange(5, 2));
  const monsters = repeat(createMockMonster, randomIntRange(5, 2));

  const monsterActors = repeat(
    () => createMockMonsterActor(randomElement(monsters)),
    randomIntRange(10, 2)
  )

  const characterPieces = characters.map(c => createMockCharacterPiece(c.id));
  const monsterPieces = monsterActors.map(ma => createMockMonsterPiece(ma.id));

  const miniTheaters = [
    ...repeat(createMockMiniTheater, randomIntRange(5, 2))
      .map(m => ({
        ...m,
        characterPieceIds: randomSlice(characterPieces).map(p => p.id),
        monsterPieceIds: randomSlice(monsterPieces).map(m => m.id),
      }))
  ]

  return {
    characters,
    monsters,

    monsterActors,

    characterPieces,
    miniTheaters,
    monsterPieces,
  }
};
