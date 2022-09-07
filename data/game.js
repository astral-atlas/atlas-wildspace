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
  MiniTheater, MiniTheaterID, MiniTheaterEvent,
  MagicItem, MagicItemID,

  MonsterActor,
  MonsterActorID,
} from "@astral-atlas/wildspace-models";

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
