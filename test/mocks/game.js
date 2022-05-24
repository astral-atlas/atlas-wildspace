// @flow strict
/*::
import type { Character } from "@astral-atlas/wildspace-models";
*/
import { randomIntRange, randomName } from "./random";

import { v4 as uuid } from 'uuid';


export const createMockPlayer = () => {

};

export const createMockGame = () => {

};

export const createMockCharacter = ()/*: Character*/ => ({
  id: uuid(),
  acBonuses: [],
  alive: 'yes',
  art: [],
  backgroundDescription: 'string',
  baseAC: randomIntRange(16, 10),
  baseACReason: 'string',
  gameId: uuid(),
  hitDice: [],
  initiativeBonus: randomIntRange(5, -3),
  initiativeIconAssetId: null,
  levels: [],
  maxHitpoints: randomIntRange(100),
  name: randomName(),
  playerId: 'UserID',
  pronouns: { enabled: false },
  sizeCategory: "medium",
  speed: randomIntRange(40, 20),
})
