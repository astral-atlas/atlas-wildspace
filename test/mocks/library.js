// @flow strict
/*::
import type { LibraryData, AssetInfo } from "@astral-atlas/wildspace-models";
*/

import { createMockImageAsset } from "./asset";
import { createMockMonster, createMockMonsterActor } from "./game";
import { createMockCharacter } from "./game.js";
import {
  createMockMiniTheater,
  createMockMonsterPiece,
  createMockTerrainPlacement,
  createMockTerrainProp,
} from "./miniTheater";
import { createMockCharacterPiece } from "./miniTheater.js";
import { randomElement, randomIntRange, randomSlice } from "./random";
import { repeat } from "./random.js";

export const createMockLibraryData = ()/*: LibraryData*/ => {
  const characters = repeat(createMockCharacter, randomIntRange(5, 2));
  const monsters = repeat(() => createMockMonster(), randomIntRange(5, 2));

  const monsterActors = repeat(
    () => createMockMonsterActor(randomElement(monsters)),
    randomIntRange(10, 2)
  )
  const terrainProps = repeat(() => createMockTerrainProp(), 10);

  const miniTheaters = repeat(() => createMockMiniTheater([
    ...repeat(() => createMockMonsterPiece(randomElement(monsterActors).id), randomIntRange(5, 2)),
    ...repeat(() => createMockCharacterPiece(randomElement(characters).id), randomIntRange(5, 2)),
  ], [
    ...repeat(() => createMockTerrainPlacement(randomElement(terrainProps).id), randomIntRange(5, 2))
  ]), randomIntRange(5, 2));
  const scenes = [

  ];
  const modelResources = [

  ];
  const playlists = [

  ];
  const tracks = [

  ]
  const locations = [

  ];
  const rooms = [

  ]
  const assets = [
    ...monsters
      .map(m => m.initiativeIconAssetId ? createMockImageAsset(m.initiativeIconAssetId) : null)
      .filter(Boolean),
    ...characters
      .map(c => c.initiativeIconAssetId ? createMockImageAsset(c.initiativeIconAssetId) : null)
      .filter(Boolean)
  ];


  return {
    characters,
    monsters,
    modelResources,
    playlists,
    rooms,
    monsterActors,
    terrainProps,
    tracks,
    miniTheaters,
    scenes,
    locations,
    assets,
  }
};

export const createMockAssetsForLibrary = ({ characters, monsters }/*: LibraryData*/)/*: AssetInfo[]*/ => {
  return [
    ...characters.map(c => c.initiativeIconAssetId ? createMockImageAsset(c.initiativeIconAssetId) : null),
    ...monsters.map(m => createMockImageAsset(m.initiativeIconAssetId)),
    
  ].filter(Boolean)
}