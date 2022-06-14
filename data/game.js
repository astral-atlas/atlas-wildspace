// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { c } from "@lukekaalim/cast"
import { createBufferCompositeTable } from "./sources/table.js"
import {
  castGameConnectionState,
  castLocation,
  castMagicItem,
  castMiniTheater,
  castNonPlayerCharacter,
  castExposition,
  castScene,
  castMonsterActor
} from "@astral-atlas/wildspace-models";
import { createFakeTransactable } from "./sources/table2.js";
import { createMemoryChannel } from "./sources/channel.js";

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type { 
  GameID, GameConnectionState, GameConnectionID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  Scene, SceneID,
  Exposition, ExpositionID,
  MiniTheater, MiniTheaterID, MiniTheaterEvent,
  MagicItem, MagicItemID,

  MonsterActor,
  MonsterActorID,
} from "@astral-atlas/wildspace-models";

import type { TableDataConstructors } from "./wildspace/table";
import type { Transactable } from "./sources/table2";
*/

/*::
export type WildspaceGameData = {
  locations:    CompositeTable<GameID, LocationID,            Location>,
  npcs:         CompositeTable<GameID, NonPlayerCharacterID,  { npc: NonPlayerCharacter }>,
  magicItems:   CompositeTable<GameID, MagicItemID, MagicItem>,

  monsterActors: CompositeTable<GameID, MonsterActorID, MonsterActor>,

  connections:  CompositeTable<GameID, GameConnectionID, GameConnectionState>,

  scenes:       CompositeTable<GameID, SceneID, Scene>,
  expositions:  CompositeTable<GameID, ExpositionID, Exposition>,
  miniTheaters: {|
    ...CompositeTable<GameID, MiniTheaterID, MiniTheater>,
    ...Transactable<GameID, MiniTheaterID, MiniTheater>,
  |},
  miniTheaterEvents: Channel<MiniTheaterID, MiniTheaterEvent>
};

type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
}
*/

export const createBufferWildspaceGameData = ({ createBufferStore,  }/*: DataConstructors*/)/*: WildspaceGameData*/ => {

  const locations = createBufferCompositeTable(createBufferStore('locations'), castLocation);
  const npcs = createBufferCompositeTable(createBufferStore('npcs'), c.obj({ npc: castNonPlayerCharacter }));
  const magicItems = createBufferCompositeTable(createBufferStore('magicItems'), castMagicItem);
  const monsterActors = createBufferCompositeTable(createBufferStore('monsterActors'), castMonsterActor);

  const connections = createBufferCompositeTable(createBufferStore('game_connections'), castGameConnectionState);

  const scenes = createBufferCompositeTable(createBufferStore('scenes'), castScene);
  const expositions = createBufferCompositeTable(createBufferStore('expositions'), castExposition);
  const miniTheaters = {
    ...createBufferCompositeTable(createBufferStore('mini_theaters'), castMiniTheater),
    ...createFakeTransactable/*:: <MiniTheater>*/(),
  };
  const miniTheaterEvents = createMemoryChannel();

  return {
    locations,
    npcs,
    scenes,
    magicItems,
    monsterActors,
    connections,
    expositions,
    miniTheaters,
    miniTheaterEvents,
  }
}
