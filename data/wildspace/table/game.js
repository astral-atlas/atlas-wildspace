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
  castMiniTheaterEvent
} from "@astral-atlas/wildspace-models";

/*::
import type { 
  GameID, GameConnectionState, GameConnectionID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  Scene, SceneID,
  Exposition, ExpositionID,
  MiniTheater, MiniTheaterID,
  MagicItem, MagicItemID,
} from "@astral-atlas/wildspace-models";

import type { TableDataConstructors } from './index.js';
import type { Transactable } from "../../sources/table2";
import type { WildspaceGameData } from "../../game";
*/


export const createTableWildspaceGameData = ({
  createChannel,
  createCompositeTable,
  createTransactable
}/*: TableDataConstructors*/)/*: WildspaceGameData*/ => {

  const locations = createCompositeTable('locations', castLocation);
  const npcs = createCompositeTable('npcs', c.obj({ npc: castNonPlayerCharacter }));
  const magicItems = createCompositeTable('magicItems', castMagicItem);
  const monsterActors = createCompositeTable('monsterActors', castMonsterActor);

  const connections = createCompositeTable('game_connections', castGameConnectionState);

  const scenes = createCompositeTable('scenes', castScene)
  const expositions = createCompositeTable('expositions', castExposition)
  const miniTheaters = {
    ...createCompositeTable('mini_theater', castMiniTheater),
    ...createTransactable('mini_theater', castMiniTheater, item => ({
      key: 'version',
      value: item.version,
    }))
  };
  const miniTheaterEvents = createChannel('mini_theater', castMiniTheaterEvent);

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
  }
}