// @flow strict
/*:: import type { Table, CompositeTable } from '../../sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from '../../sources/buffer.js'; */
/*:: import type { Channel } from '../../sources/channel.js'; */

/*:: import type { WildspaceData } from "../../entry"; */
/*::
import type { Cast } from "@lukekaalim/cast";
*/

import * as m from '@astral-atlas/wildspace-models';
import * as sm from '@astral-atlas/sesame-models';
import { c } from '@lukekaalim/cast';

import { createBufferTable, createBufferCompositeTable, createFakeCompositeTable } from "../../sources/table.js";
import { createMemoryChannel } from "../../sources/channel.js";
import { createExpiryTable } from "../../sources/expiry.js";
import { createBufferWildspaceGameData } from '../../game.js';
import { createBufferWildspaceRoomData, createTableWildspaceRoomData } from "../../room.js";
import { createMemoryBufferStore } from '../../sources/buffer.js';
import { createTableWildspaceGameData } from "../../game.js";
import { createTableWikiData } from './wiki.js';

/*::
export type TableDataConstructors = {
  createCompositeTable: <PK: string, SK: string, Item>(uniqueKey: string, cast: Cast<Item>) => CompositeTable<PK, SK, Item>,
  createTable: <K: string, Item>(uniqueKey: string, cast: Cast<Item>) => Table<K, Item>,
  createChannel: <K: string, V>(uniqueKey: string, cast: Cast<V>) => Channel<K, V>,
}
*/

export const createTableWildspaceData = (constructors/*: TableDataConstructors*/)/*: WildspaceData*/ => {
  const assets = constructors.createTable('assets', m.castAssetDescription);
  const assetData = createFakeCompositeTable();
  const assetLinkCache = createExpiryTable(createMemoryBufferStore(), c.obj({ downloadURL: c.str }));
  

  const game =              constructors.createTable('game', c.obj({ id: m.castGameId, name: c.str, gameMasterId: sm.castUserId }));
  const gameParticipation = constructors.createCompositeTable('gameParticipation', c.obj({ gameId: m.castGameId, joined: c.bool }));
  const gamePlayers =       constructors.createCompositeTable('gamePlayers', c.obj({ userId: sm.castUserId, joined: c.bool }));
  const gameUpdates =       constructors.createChannel('gameUpdates', m.castGameUpdate);


  const characters =  constructors.createCompositeTable('characters',  m.castCharacter);
  const encounters =  constructors.createCompositeTable('encounters',  m.castEncounter);
  const monsters =    constructors.createCompositeTable('monsters',  m.castMonster);

  const gameData = createTableWildspaceGameData(constructors);
  const roomData = createTableWildspaceRoomData(constructors);
  const wiki =     createTableWikiData(constructors);

  const room =          constructors.createCompositeTable('room', m.castRoom);
  const roomAudio =     constructors.createCompositeTable('roomAudio', m.castRoomAudioState);
  const roomEncounter = constructors.createCompositeTable('roomEncounter', m.castEncounterState);
  const roomUpdates =   constructors.createChannel('roomUpdates', m.castRoomUpdate);

  const playlists = constructors.createCompositeTable('playlists', m.castAudioPlaylist);
  const tracks =    constructors.createCompositeTable('tracks', m.castAudioTrack);

  return {
    assets,
    assetData,
    assetLinkCache,

    gameData,
    game,
    gameUpdates,
    gameParticipation,
    gamePlayers,

    characters,
    encounters,
    monsters,

    roomData,
    room,
    roomAudio,
    roomUpdates,
    roomEncounter,

    playlists,
    tracks,
    wiki,
  };
}