// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { LibraryData, Monster, MonsterActor } from "@astral-atlas/wildspace-models";
*/

import { h } from "@lukekaalim/act";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { LibraryShelf } from "../LibraryShelf";
import { useLibrarySelection } from "../librarySelection";

/*::
export type MonsterAisleProps = {
  client: WildspaceClient,
  monsters: $ReadOnlyArray<Monster>,
  monsterActors: $ReadOnlyArray<MonsterActor>,
}
*/

export const MonsterAsile/*: Component<MonsterAisleProps>*/ = ({
  client,
  monsters,
  monsterActors
}) => {
  const selection = useLibrarySelection();

  return h(LibraryAisle, {
    floor: h(LibraryFloor, {
      header: [
        h(LibraryFloorHeader, { title: 'Monsters' })
      ]
    }, [
      h(LibraryShelf, { selection, title: 'All Monsters', books: monsters.map(m => ({
        title: m.name,
        id: `monster:${m.id}`
      })) }),
      h(LibraryShelf, { selection, title: 'All Monster Actors', books: monsterActors.map(ma => ({
        title: ma.name || monsters.find(m => m.id === ma.monsterId)?.name || '',
        id: `monster-actor:${ma.id}`
      })) })
    ]),
    desk: [

    ]
  })
}