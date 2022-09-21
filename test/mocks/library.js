// @flow strict
/*::
import type { LibraryData, AssetInfo } from "@astral-atlas/wildspace-models";
*/

import { createMockImageAsset } from "./asset";
import { createMockMonster, createMockMonsterActor } from "./game";
import { createMockCharacter } from "./game.js";
import { createMockMiniTheater, createMockMonsterPiece } from "./miniTheater";
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

  const miniTheaters = [
    ...repeat(() => createMockMiniTheater(), randomIntRange(5, 2))
      .map(m => ({
        ...m,
        pieces: [
          ...repeat(() => createMockMonsterPiece(randomElement(monsterActors).id), randomIntRange(5, 2)),
          ...repeat(() => createMockCharacterPiece(randomElement(characters).id), randomIntRange(5, 2)),
        ],
      }))
  ]
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
  const terrainProps = [

  ]
  const assets = [];


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