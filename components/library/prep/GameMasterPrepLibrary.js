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
import { LocationAisle } from "../aisle/LocationAisle";
import { RoomAisle } from "../aisle/RoomAisle";
import { AudioTrackAisle } from "../aisle/AudioTrackAisle";
import { AudioPlaylistAisle } from "../aisle/AudioPlaylistAisle";
import { ResourcesAisle } from "../aisle/ResourcesAisle";
import { MiniTheaterTerrainAisle } from "../aisle/MiniTheaterTerrainAisle";
import { MagicItemAisle } from "../aisle/MagicItemAisle";

/*::
export type GameMasterPrepLibraryProps = {
  catalogueHeader?: ?ElementNode,

  client: WildspaceClient,
  game: Game,
  userId: UserID,

  updates: UpdatesConnection,
  data: LibraryData,
};
*/

export const GameMasterPrepLibrary/*: Component<GameMasterPrepLibraryProps>*/ = ({
  catalogueHeader = null,
  client,
  game,
  userId,

  updates,
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
        library: data,
        miniTheaters: data.miniTheaters,
        characters: data.characters,
        monsters: data.monsters,
        monsterActors: data.monsterActors,
        assets,
        updates,
        client, game, userId
      })
    },
    {
      key: 'THEATERS_TERRAIN',
      title: 'Mini Theaters/Terrain',
      component: h(MiniTheaterTerrainAisle, {
        library: data,
        assets,
        client, game, userId
      })
    },
    {
      key: 'RESOURCES',
      title: 'Resources',
      component: h(ResourcesAisle, {
        library: data,
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
        miniTheaters: data.miniTheaters,
        client, game, userId,
        data,
        connection: updates,
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
        library: data,
        assets,
        updates,
        rooms: data.rooms,
        client, game, userId
      })
    },
    {
      key: 'MAGIC_ITEM',
      title: 'Magic Item',
      component: h(MagicItemAisle, {
        library: data,
        client,
        game
      })
    },
    {
      key: 'TRACK',
      title: 'Audio Tracks',
      component: h(AudioTrackAisle, {
        assets,
        library: data,
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
