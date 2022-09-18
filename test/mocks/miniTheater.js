// @flow strict
/*::
import type { CharacterID, Character, Monster, MiniTheater, MonsterActorID, Piece, BoardPosition } from "@astral-atlas/wildspace-models";
*/
import { randomGameName } from "./random";
import { randomIntRange } from "./random.js";
import { v4 as uuid } from 'uuid';

export const createMockMiniTheater = (pieces/*: Piece[]*/ = [])/*: MiniTheater*/ => ({
  id: uuid(),
  name: randomGameName(),
  version: uuid(),
  
  baseArea: { position: { x: 0, y: 0, z: 0}, size: { x: 10, y: 10, z: 1 } },
  pieces,
});

export const createMockMonsterPiece = (monsterActorId/*: MonsterActorID*/)/*: Piece*/ => ({
  id: uuid(),
  visible: true,
  position: createMockPosition(),
  represents: {
    type: 'monster',
    monsterActorId,
  },
})
export const createMockCharacterPiece = (characterId/*: CharacterID*/)/*: Piece*/ => ({
  id: uuid(),
  visible: true,
  position: createMockPosition(),
  represents: {
    type: 'character',
    characterId,
  },
})

export const createMockPosition = ()/*: BoardPosition*/ => ({
  x: randomIntRange(10, -10),
  y: randomIntRange(10, -10),
  z: 0,
})