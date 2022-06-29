// @flow strict
/*::
import type { Component } from "@lukekaalim/act";

import type { UserID } from "@astral-atlas/sesame-models";
import type { Game, LibraryData } from "@astral-atlas/wildspace-models";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { ElementNode } from "@lukekaalim/act";
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
import { RoomAisle } from "../aisle/RoomAisle";
import { AudioTrackAisle } from "../aisle/AudioTrackAisle";
import { AudioPlaylistAisle } from "../aisle/AudioPlaylistAisle";

/*::
export type GameMasterPrepLibraryProps = {
  catalogueHeader?: ?ElementNode,

  client: WildspaceClient,
  game: Game,
  userId: UserID,

  data: LibraryData,
};
*/

export const GameMasterPrepLibrary/*: Component<GameMasterPrepLibraryProps>*/ = ({
  catalogueHeader = null,
  client,
  game,
  userId,

  data,
}) => {

  const assets = new Map(data.assets.map(a => [a.description.id, a]))

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
        assets,
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
    {
      key: 'ROOM',
      title: 'Room',
      component: h(RoomAisle, {
        assets,
        rooms: data.rooms,
        client, game, userId
      })
    },
    {
      key: 'TRACK',
      title: 'Audio Tracks',
      component: h(AudioTrackAisle, {
        assets,
        tracks: data.tracks,
        game,
        client,
      })
    },
    {
      key: 'PLAYLIST',
      title: 'Audio Playlists',
      component: h(AudioPlaylistAisle, {
        assets,
        tracks: data.tracks,
        playlists: data.playlists,
        game,
        client,
      })
    },
  ]

  const [activeAisleKey, setActiveAisleKey] = useState(aisleComponents[0].key);

  const activeAisle = aisleComponents.find(a => a.key === activeAisleKey);

  return h(Library, {
    catalogue: [
      catalogueHeader && [
        catalogueHeader,
        h('hr'),
      ],
      h(LibraryCatalogue, {
        activeAisleId: activeAisleKey,
        aisles: aisleComponents.map(a => ({ id: a.key, title: a.title })),
        onActivateAisle: id => setActiveAisleKey(id)
      })
    ],
    aisle: !!activeAisle && activeAisle.component,
  });
}
