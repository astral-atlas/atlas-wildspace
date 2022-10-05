// @flow strict
/*:: import type { Table, CompositeTable } from '../../sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from '../../sources/buffer.js'; */
/*:: import type { Channel } from '../../sources/channel.js'; */

/*:: import type { WildspaceData } from "../../entry"; */
/*::
import type { Cast } from "@lukekaalim/cast";
import type { DynamoDBValueType } from "@aws-sdk/client-dynamodb";
import type { Transactable } from "../../sources/table2";
import type { WildspaceDataSources } from "../../sources";
*/

import * as m from '@astral-atlas/wildspace-models';
import * as sm from '@astral-atlas/sesame-models';
import { c } from '@lukekaalim/cast';

import { createBufferTable, createBufferCompositeTable, createFakeCompositeTable } from "../../sources/table.js";
import { createMemoryChannel } from "../../sources/channel.js";
import { createExpiryTable } from "../../sources/expiry.js";
import { createTableWildspaceRoomData } from "../../room.js";
import { createMemoryBufferStore } from '../../sources/buffer.js';
import { createTableWildspaceGameData } from "./game.js";
import { createTableWikiData } from './wiki.js';
import { createTableAssetData } from "../../asset.js";

export const createTableWildspaceData = (sources/*: WildspaceDataSources*/)/*: WildspaceData*/ => {
  const assets = sources.createTable('assets', m.castAssetDescription);
  const assetData = createFakeCompositeTable();
  const assetsData = createTableAssetData(sources);
  const assetLinkCache = createExpiryTable(createMemoryBufferStore(), c.obj({ downloadURL: c.str }));
  

  const game =              sources.createTable('game', c.obj({ id: m.castGameId, name: c.str, gameMasterId: sm.castUserId }));
  const gameParticipation = sources.createCompositeTable('gameParticipation', c.obj({ gameId: m.castGameId, joined: c.bool }));
  const gamePlayers =       sources.createCompositeTable('gamePlayers', c.obj({ userId: sm.castUserId, joined: c.bool }));
  const gameUpdates =       sources.createChannel('gameUpdates', m.castGameUpdate);


  const characters =  sources.createCompositeTable('characters',  m.castCharacter);
  const encounters =  sources.createCompositeTable('encounters',  m.castEncounter);
  const monsters =    sources.createCompositeTable('monsters',  m.castMonster);

  const gameData = createTableWildspaceGameData(sources);
  const roomData = createTableWildspaceRoomData(sources);
  const wiki =     createTableWikiData(sources);

  const room =          sources.createCompositeTable('room', m.castRoom);
  const roomAudio =     sources.createCompositeTable('roomAudio', m.castRoomAudioState);
  const roomEncounter = sources.createCompositeTable('roomEncounter', m.castEncounterState);

  const playlists = sources.createCompositeTable('playlists', m.castAudioPlaylist);
  const tracks =    sources.createCompositeTable('tracks', m.castAudioTrack);

  return {
    assets,
    assetData,
    assetsData,
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
    roomEncounter,

    playlists,
    tracks,
    wiki,
  };
}