// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { c } from "@lukekaalim/cast"
import { createBufferCompositeTable } from "./sources/table.js"
import {
  castExpositionScene,
  castGameConnectionState,
  castLocation,
  castMagicItem,
  castNonPlayerCharacter
} from "@astral-atlas/wildspace-models"

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type { 
  GameID, GameConnectionState,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  ExpositionSceneID, ExpositionScene,
} from "@astral-atlas/wildspace-models";
import type { TableDataConstructors } from "./wildspace/table";
import type { MagicItem, MagicItemID } from "../models/game/magicItem";
import type { GameConnectionID } from "../models/game/connection";
*/

/*::
export type WildspaceGameData = {
  locations:  CompositeTable<GameID, LocationID,            { location: Location }>,
  npcs:       CompositeTable<GameID, NonPlayerCharacterID,  { npc: NonPlayerCharacter }>,
  magicItems: CompositeTable<GameID, MagicItemID, MagicItem>,

  connections: CompositeTable<GameID, GameConnectionID, GameConnectionState>,

  scenes: {
    expositions: CompositeTable<GameID, ExpositionSceneID, { exposition: ExpositionScene }>,
  },
};

type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
}
*/

export const createBufferWildspaceGameData = ({ createBufferStore }/*: DataConstructors*/)/*: WildspaceGameData*/ => {

  const locations = createBufferCompositeTable(createBufferStore('locations'), c.obj({ location: castLocation }));
  const npcs = createBufferCompositeTable(createBufferStore('npcs'), c.obj({ npc: castNonPlayerCharacter }));
  const magicItems = createBufferCompositeTable(createBufferStore('magicItems'), castMagicItem);

  const connections = createBufferCompositeTable(createBufferStore('game_connections'), castGameConnectionState);

  const scenes = {
    expositions: createBufferCompositeTable(createBufferStore('expositionScenes'), c.obj({ exposition: castExpositionScene })),
  }

  return {
    locations,
    npcs,
    scenes,
    magicItems,
    connections,
  }
}

export const createTableWildspaceGameData = ({ createChannel, createCompositeTable }/*: TableDataConstructors*/)/*: WildspaceGameData*/ => {

  const locations = createCompositeTable('locations', c.obj({ location: castLocation }));
  const npcs = createCompositeTable('npcs', c.obj({ npc: castNonPlayerCharacter }));
  const magicItems = createCompositeTable('magicItems', castMagicItem);

  const connections = createCompositeTable('game_connections', castGameConnectionState);

  const scenes = {
    expositions: createCompositeTable('expositionScenes', c.obj({ exposition: castExpositionScene })),
  }

  return {
    locations,
    magicItems,
    connections,
    npcs,
    scenes,
  }
}