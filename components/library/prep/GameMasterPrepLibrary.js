// @flow strict
/*::
import type { Component } from "@lukekaalim/act";

import type { UserID } from "@astral-atlas/sesame-models";
import type { Game, LibraryData } from "@astral-atlas/wildspace-models";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";

import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { h, useEffect, useState } from "@lukekaalim/act";
import { CharacterAisle } from "../aisle/CharacterAisle";
import { MiniTheaterAisle } from "../aisle/MiniTheaterAisle";
import { MonsterAsile } from "../aisle/MonsterAisle";
import { Library } from "../Library";
import { LibraryCatalogue } from "../LibraryCatalogue";
import { SceneAisle } from "../aisle/ScenesAisle";
import { ExpositionAisle } from "../aisle/ExpositionAisle";
import { LocationAisle } from "../aisle/LocationAisle";

/*::
export type GameMasterPrepLibraryProps = {
  client: WildspaceClient,
  game: Game,
  userId: UserID,

  updates: UpdatesConnection,
  assets: AssetDownloadURLMap,
};
*/

export const GameMasterPrepLibrary/*: Component<GameMasterPrepLibraryProps>*/ = ({
  client,
  game,
  userId,

  updates,
  assets,
}) => {
  const [data, setData] = useState(null);
  useEffect(() => updates.library.subscribe(setData), [updates]);
  if (!data)
    return null;

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
    {
      key: 'SCENE',
      title: 'Scene',
      component: h(SceneAisle, {
        assets,
        scenes: data.scenes,
        locations: data.locations,
        expositions: data.expositions,
        miniTheaters: data.miniTheaters,
        client, game, userId
      })
    },
    {
      key: 'EXPOSIT',
      title: 'Exposition',
      component: h(ExpositionAisle, {
        assets,
        locations: data.locations,
        expositions: data.expositions,
        client, game, userId
      })
    },
    {
      key: 'LOC',
      title: 'Location',
      component: h(LocationAisle, {
        assets,
        locations: data.locations,
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