// @flow strict
/*::
import type { CharacterID, Character, Monster, MiniTheater, MonsterActorID, MonsterPiece, CharacterPiece } from "@astral-atlas/wildspace-models";
*/
import { randomGameName } from "./random";
import { randomIntRange } from "./random.js";
import { v4 as uuid } from 'uuid';

export const createMockMiniTheater = ()/*: MiniTheater*/ => ({
  id: uuid(),
  name: randomGameName(),

  characterPieceIds: [],
  monsterPieceIds: [],
});

export const createMockMonsterPiece = (monsterActorId/*: MonsterActorID*/)/*: MonsterPiece*/ => ({
  id: uuid(),
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  monsterActorId,
})
export const createMockCharacterPiece = (characterId/*: CharacterID*/)/*: CharacterPiece*/ => ({
  id: uuid(),
  position: { x: 0, y: 0, z: 0 },
  characterId,
})