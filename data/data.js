// @flow strict
/*:: import type { Table, CompositeTable } from './sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

/*:: import type { WildspaceData } from "./entry"; */

import * as m from '@astral-atlas/wildspace-models';
import * as sm from '@astral-atlas/sesame-models';
import { c } from '@lukekaalim/cast';

import { createBufferTable, createBufferCompositeTable } from "./sources/table.js";
import { createMemoryChannel } from "./sources/channel.js";

/*::
type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
  createBufferDB: (name: string) => BufferDB<string>,
}
*/

export const createBufferWildspaceData = ({ createBufferStore, createBufferDB }/*: DataConstructors*/)/*: { data: WildspaceData }*/ => {
  const assets = createBufferTable(createBufferStore('assets'), m.castAssetDescription);
  const assetData = createBufferDB('assetData');

  const game = createBufferTable(createBufferStore('game'), c.obj({ id: m.castGameId, name: c.str, gameMasterId: sm.castUserId }));
  const gameUpdates = createMemoryChannel();
  const gameParticipation = createBufferCompositeTable(createBufferStore('game_participation'), c.obj({ gameId: m.castGameId, joined: c.bool }));
  const gamePlayers = createBufferCompositeTable(createBufferStore('game_players'), c.obj({ userId: sm.castUserId, joined: c.bool }));

  const characters = createBufferCompositeTable(createBufferStore('characters'), m.castCharacter);
  const encounters = createBufferCompositeTable(createBufferStore('encounters'), m.castEncounter);
  const monsters = createBufferCompositeTable(createBufferStore('monsters'), m.castMonster);

  const room = createBufferCompositeTable(createBufferStore('room'), m.castRoom);
  //const roomState = createBufferCompositeTable(createBufferStore('roomState'), m.castRoomState);
  const roomAudio = createBufferCompositeTable(createBufferStore('roomAudio'), m.castRoomAudioState);
  const roomEncounter = createBufferCompositeTable(createBufferStore('roomEncounter'), m.castEncounterState);
  const roomUpdates = createMemoryChannel();

  const playlists = createBufferCompositeTable(createBufferStore('playlists'), m.castAudioPlaylist);
  const tracks = createBufferCompositeTable(createBufferStore('tracks'), m.castAudioTrack);

  const data = {
    assets,
    assetData,

    game,
    gameUpdates,
    gameParticipation,
    gamePlayers,

    characters,
    encounters,
    monsters,

    room,
    roomAudio,
    roomEncounter,
    roomUpdates,

    playlists,
    tracks
  }

  return { data };
};