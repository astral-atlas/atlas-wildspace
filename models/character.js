// @flow strict
/*:: import type { PlayerID } from './main'; */
/*:: import type { GameID } from './game'; */
/*:: import type { UUID } from './id'; */
const { toPlayerID } = require('./users');
const { toUUID } = require('./id');
const { toObject, toString, toNumber, toArray } = require('./casting');
const { toGameID } = require('./game');

/*::
type CharacterID = UUID;
type Character = {
  id: CharacterID,
  player: PlayerID,
  game: GameID,

  name: string,
  description: string,
  imageURL: string,

  hitPoints: number,
  armorClass: number,
  conditions: string[],
};

type MonsterID = UUID;
type Monster = {
  id: MonsterID,
  game: GameID,

  name: string,
  imageURL: string,

  healthDescription: string,
  conditions: string[],
};

export type {
  CharacterID,
  Character,

  MonsterID,
  Monster,
};
*/

const toCharacterID = (value/*: mixed*/)/*: CharacterID*/ => toUUID(value);
const toCharacter = (value/*: mixed*/)/*: Character*/ => {
  const object = toObject(value);
  return {
    id: toCharacterID(object.id),
    game: toGameID(object.game),
    player: toPlayerID(object.player),

    name: toString(object.name),
    description: toString(object.description),
    imageURL: toString(object.imageURL),


    hitPoints: toNumber(object.hitPoints),
    armorClass: toNumber(object.armorClass),
    conditions: toArray(object.conditions).map(toString),
  };
};

const toMonsterID = (value/*: mixed*/)/*: MonsterID*/ => toUUID(value);
const toMonster = (value/*: mixed*/)/*: Monster*/ => {
  const object = toObject(value);
  return {
    id: toMonsterID(object.id),
    game: toGameID(object.game),

    name: toString(object.name),
    imageURL: toString(object.imageURL),

    healthDescription: toString(object.healthDescription),
    conditions: toArray(object.conditions).map(toString),
  };
};

module.exports = {
  toCharacterID,
  toCharacter,
  
  toMonsterID,
  toMonster,
}