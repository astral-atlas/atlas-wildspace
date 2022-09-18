// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

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

  TerrainProp,
  TerrainPropID,
} from "@astral-atlas/wildspace-models";

import type { Transactable } from "./sources/table2";
import type { ExpirableCompositeTable } from "./sources/expiry";
import type { DynamoDBTable } from "./sources/dynamoTable";
import type { ModelResource, ModelResourceID } from "../models/game/resources";
*/

/*::
export type WildspaceGameData = {
  locations:    CompositeTable<GameID, LocationID,            Location>,
  npcs:         CompositeTable<GameID, NonPlayerCharacterID,  { npc: NonPlayerCharacter }>,
  magicItems:   CompositeTable<GameID, MagicItemID, MagicItem>,

  monsterActors: CompositeTable<GameID, MonsterActorID, MonsterActor>,

  connections:  DynamoDBTable<GameID, GameConnectionID, GameConnectionState>,

  scenes:       CompositeTable<GameID, SceneID, Scene>,
  miniTheaters: {|
    ...CompositeTable<GameID, MiniTheaterID, MiniTheater>,
    ...Transactable<GameID, MiniTheaterID, MiniTheater>,
  |},
  miniTheaterEvents: Channel<MiniTheaterID, MiniTheaterEvent>,

  resources: {
    models: DynamoDBTable<GameID, ModelResourceID, ModelResource>,
  },
  miniTheater: {
    terrainProps: DynamoDBTable<GameID, TerrainPropID, TerrainProp>,
  },

  gameDataEvent: Channel<GameID, string>,
};
*/
