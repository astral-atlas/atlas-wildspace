// @flow strict
/*::
import type { Component } from "@lukekaalim/act";

import type { UserID } from "@astral-atlas/sesame-models";
import type { Game, LibraryData } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";

import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { h, useState } from "@lukekaalim/act";
import { CharacterAisle } from "../aisle/CharacterAisle";
import { MiniTheaterAisle } from "../aisle/MiniTheaterAisle";
import { MonsterAsile } from "../aisle/MonsterAisle";
import { Library } from "../Library";
import { LibraryCatalogue } from "../LibraryCatalogue";

/*::
export type GameMasterPrepLibraryProps = {
  client: WildspaceClient,
  game: Game,
  userId: UserID,

  data: LibraryData,
  assets: AssetDownloadURLMap,
};
*/

export const GameMasterPrepLibrary/*: Component<GameMasterPrepLibraryProps>*/ = ({
  client,
  game,
  userId,

  data,
  assets,
}) => {
  const aisleComponents = [
    {
      key: 'CHARS',
      title: 'Characters',
      component: h(CharacterAisle, {
        characters: data.characters,
        assets, client, game, userId
      })
    },
    {
      key: 'THEATERS',
      title: 'Mini Theaters',
      component: h(MiniTheaterAisle, {
        miniTheaters: data.miniTheaters,
        characterPieces: data.characterPieces,
        monsterPieces: data.monsterPieces,
        characters: data.characters,
        monsters: data.monsters,
        monsterActors: data.monsterActors,
        assets,
        client, game, userId
      })
    },
    {
      key: 'MONST',
      title: 'Monsters',
      component: h(MonsterAsile, {
        monsters: data.monsters,
        monsterActors: data.monsterActors,
        client, game, userId
      })
    },
  ]

  const [activeAisleKey, setActiveAisleKey] = useState(aisleComponents[0].key);

  const activeAisle = aisleComponents.find(a => a.key === activeAisleKey);

  return h(Library, {
    catalogue: [
      h(LibraryCatalogue, {
        activeAisleId: activeAisleKey,
        aisles: aisleComponents.map(a => ({ id: a.key, title: a.title })),
        onActivateAisle: id => setActiveAisleKey(id)
      })
    ],
    aisle: !!activeAisle && activeAisle.component,
  });
}