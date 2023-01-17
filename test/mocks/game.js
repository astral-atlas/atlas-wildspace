// @flow strict
/*::
import type {
  Tag,
  Character,
  Game,
  MonsterID, Monster, MonsterActor,
  MagicItem,
  GameMetaResource, GameMeta,
  ModelResource
} from "@astral-atlas/wildspace-models";
*/
import {
  randomGameName,
  randomIntRange,
  randomMonsterName,
  randomName,
  randomHumanName,
  randomObjectName,
  randomSoftColor,
} from "./random";

import { v4 as uuid } from 'uuid';
import { emptyRootNode } from "@astral-atlas/wildspace-models";


export const createMockPlayer = () => {

};

export const createMockGame = ()/*: Game*/ => ({
  id: uuid(),
  name: randomGameName(),
  gameMasterId: uuid(),
});

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
  initiativeIconAssetId: uuid(),
  levels: [],
  maxHitpoints: randomIntRange(100),
  name: randomName(),
  playerId: 'UserID',
  pronouns: { enabled: false },
  sizeCategory: "medium",
  speed: randomIntRange(40, 20),
});

export const createMockMonster = ({
  iconURL = '', initiativeIconAssetId = uuid()
}/*: { iconURL?: string, initiativeIconAssetId?: string }*/ = {})/*: Monster*/ => ({
  id: uuid(),
  gameId: uuid(),

  name: randomMonsterName(),
  iconURL,
  initiativeIconAssetId,

  shortDescription: `Friend of ${randomMonsterName()}`,

  maxHitpoints: randomIntRange(100),
})
export const createMockMonsterActor = (monster/*: Monster*/)/*: MonsterActor*/ => ({
  id: uuid(),
  monsterId: monster.id,
  name: `${monster.name} (as played by ${randomHumanName()})`,
  secretName: null,

  hitpoints: randomIntRange(100),
  conditions: [],
})

export const createMockMagicItem = ()/*: MagicItem*/ => ({
  id: uuid(),
  title: randomObjectName(),
  description: emptyRootNode.toJSON(),
  rarity: 'Uncommon',
  requiresAttunement: false,
  type: 'Weapon (sword)',
  visibility: { type: 'players-in-game' }
})

export const createMockTag = ()/*: Tag*/ => ({
  id: uuid(),
  title: randomObjectName(),
  version: uuid(),

  color: randomSoftColor(),
  description: `A randomly generated tag`,
  gameId: uuid(),
  tags: [],
  visibility: { type: 'players-in-game' }
})

export const createMockGameResourceMeta = ()/*: GameMeta<string>*/ => ({
  id: uuid(),
  gameId: uuid(),

  title: randomObjectName(),
  visibility: { type: 'players-in-game' },
  version: uuid(),

  tags: [],
})

export const createMockModelResource = ()/*: ModelResource*/ => ({
  ...createMockGameResourceMeta(),
  assetId: uuid(),
  format: 'gltf',
  previewCameraPath: null
})