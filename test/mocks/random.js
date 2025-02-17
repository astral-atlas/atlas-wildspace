// @flow strict
import { v4 as uuid } from 'uuid';
import seedrandom from 'seedrandom';
import { Box3, Vector3 } from "three";

export const repeat = /*:: <T>*/(func/*: (index: number) => T*/, count/*: number*/)/*: T[]*/ =>
  Array.from({ length: count }).map((_, i) => func(i));

export const randomSlice = /*:: <T>*/(a/*: T[]*/)/*: T[]*/ => {
  const b = randomIntRange(a.length - 1);
  const c = randomIntRange(a.length - 1);

  const start = Math.min(b, c);
  const end = Math.max(b, c);

  return a.slice(start, end);
}

export const randomIntRange = (max/*: number*/, min/*: number*/ = 0, seed/*: ?string*/ = null)/*: number*/ => {
  return Math.round(min + (seedrandom(seed)() * (max - min)));
}

export const randomElement = /*:: <T>*/(array/*: $ReadOnlyArray<T>*/)/*: T*/ => {
  const i = randomIntRange(array.length - 1);
  return array[i];
}

export const randomGameName = ()/*: string*/ => [
  randomElement([
    "Battle of",
    "Duel at",
    "Showdown under",
    "Finale:",
    "Encounter with the",
  ]),

  randomElement([
    "Dark",
    "Bloody",
    "Legendary",
    "Scorching",
    "Wispy",
    "Ultimate",
    "Mysterious",
    "Imperial",
    "Familiar",
  ]),

  randomElement([
    "Lifeform",
    "Shadow Clone",
    "Goblins",
    "Foe",
    "Sunset",
    "Artefact",
    "Sword",
    "Curse",
  ])
].join(' ');


export const randomName = ()/*: string*/ => randomElement([
  "Veil of Shadows",
  "Vari the Able",
  "Vardette the Bardette",
  "Elara",
  "Mi Yooman",
  "Mórríghan Chalchiuhtlicue",
  "Amaya Saprai Karwasra"
]);

export const randomMonsterName = ()/*: string*/ => [
  randomElement(['Scary', 'Worried', 'Powerful', 'Deranged', "Quick", "Super", "Lava", "Acid", "Sentient"]),
  randomElement(['Dog', 'Cat', 'Tortise', 'Goblin', "Wizard", "Meteor", "Rock", "Slime"]),
].join(' ')

export const randomHumanName = ()/*: string*/ => [
  randomElement([
    "Luke",
    "Nicky",
    "Alex",
    "Tala",
  ]),
  randomElement([
    "Jase",
    "Anthony",
    "Martin",
    "Phillip",
    "Jane",
    "Riannah",
  ]),
  randomElement([
    "Kaalim",
  ])
].join(' ')

export const randomObjectName = ()/*: string*/ => [
  randomElement([
    "Long",
    "Short",
    "Tall",
    "Wide",
    "Expansive",
    "Compressed",
    "Mini",
    "Dire",
    ""
  ]),
  randomElement([
    "Colorful",
    "Dangerous",
    "Magical",
    "Corrupted",
    "Sentient",
    "Summoned",
    "Destroyed",
    "Evil",
    "\"The Rock\"",
    ""
  ]),
  randomElement([
    "Rock",
    "Boulder",
    "Tree",
    "Cover",
    "Building",
    "Stone",
    "Foiliage",
    "Tower",
    "Signpost",
  ]),
].filter(Boolean).join(' ')

export const randomVector = ()/*: Vector3*/ => {
  return new Vector3(
    randomIntRange(10, -10),
    randomIntRange(10, -10),
    randomIntRange(10, -10)
  );
}
export const randomBox3 = ()/*: Box3*/ => {
  return new Box3()
    .setFromCenterAndSize(
      randomVector().multiplyScalar(2),
      randomVector().addScalar(10)
    )
}