// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */

import { c } from "@lukekaalim/cast"
import {
  castGameConnectionState,
  castLocation,
  castMagicItem,
  castMiniTheater,
  castNonPlayerCharacter,
  castExposition,
  castScene,
  castMonster,
  castMonsterActor,
  castMiniTheaterAction,
  castMiniTheaterEvent,
  castTerrainProp,
  castModelResource,
  castTag
} from "@astral-atlas/wildspace-models";

/*::
import type { 
  GameID, GameConnectionState, GameConnectionID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  Scene, SceneID,
  MiniTheater, MiniTheaterID,
  MagicItem, MagicItemID,
} from "@astral-atlas/wildspace-models";

import type { Transactable } from "../../sources/table2";
import type { WildspaceGameData } from "../../game";
import type { WildspaceDataSources } from "../../sources";
*/

export const createTableWildspaceGameData = (sources/*: WildspaceDataSources*/)/*: WildspaceGameData*/ => {
  const locations = sources.createCompositeTable('locations', castLocation);
  const npcs = sources.createCompositeTable('npcs', c.obj({ npc: castNonPlayerCharacter }));
  const magicItems = sources.createCompositeTable('magicItems', castMagicItem);
  const monsterActors = sources.createCompositeTable('monsterActors', castMonsterActor);

  const connections = sources.createDynamoDBTable('game_connections', castGameConnectionState);

  const scenes = sources.createCompositeTable('scenes', castScene)
  const expositions = sources.createCompositeTable('expositions', castExposition)
  const miniTheaters = {
    ...sources.createCompositeTable('mini_theater', castMiniTheater),
    ...sources.createTransactable('mini_theater', castMiniTheater, 'version')
  };
  const miniTheaterEvents = sources.createChannel('mini_theater', castMiniTheaterEvent);

  const resources = {
    models: sources.createDynamoDBTable('resources_models', castModelResource),
  };
  const miniTheater = {
    terrainProps: sources.createDynamoDBTable('mini_theater_terrain_props', castTerrainProp),
  }
  const gameDataEvent = sources.createChannel('game_data', c.str);
  const tags = sources.createDynamoDBTable('tags', castTag);

  return {
    locations,
    magicItems,
    monsterActors,
    connections,
    npcs,
    scenes,
    expositions,
    miniTheaters,
    miniTheaterEvents,
    resources,
    miniTheater,
    gameDataEvent,
    tags,
  }
}