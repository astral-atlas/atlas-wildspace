// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameID, RoomID, Room, RoomState, RoomUpdate, EncounterState, AudioPlaylistState } from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */
/*:: import type { HTTPServiceClient, WSServiceClient } from './entry.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';
import { createJSONConnectionClient } from '@lukekaalim/ws-client';

import { roomAPI } from "@astral-atlas/wildspace-models";

/*::
export type RoomClient = {
  read: (gameId: GameID, roomId: RoomID) => Promise<Room>,
  connectUpdates: (gameId: GameID, roomId: RoomID, onUpdate: (state: RoomUpdate) => mixed) => { close: () => Promise<void> },
  
  readAudio: (gameId: GameID, roomId: RoomID) => Promise<null | AudioPlaylistState>,
  setAudio: (gameId: GameID, roomId: RoomID, audio: ?AudioPlaylistState) => Promise<void>,
  readEncounter: (gameId: GameID, roomId: RoomID) => Promise<null | EncounterState>,
  setEncounter: (gameId: GameID, roomId: RoomID, encounter: ?EncounterState) => Promise<void>,

  list: (gameId: GameID) => Promise<$ReadOnlyArray<Room>>,
  create: (gameId: GameID, title: string) => Promise<Room>,
  update: (gameId: GameID, roomId: RoomID, room: Room) => Promise<void>,
};
*/

export const createRoomClient = (http/*: HTTPServiceClient*/, ws/*: WSServiceClient*/)/*: RoomClient*/ => {
  const roomResource = http.createResource(roomAPI['/room']);
  const roomAudioResource = http.createResource(roomAPI['/room/audio']);
  const roomEncounterResource = http.createResource(roomAPI['/room/encounter']);
  const allTracksResource = http.createResource(roomAPI['/room/all']);

  const updatesConnection = ws.createConnection(roomAPI['/room/updates']);

  const read = async (gameId, roomId) => {
    const { body: { room }} = await roomResource.GET({ query: { roomId, gameId }});
    return room;
  };
  const connectUpdates = (gameId, roomId, onUpdate) => {
    const recieve = (e) => {
      onUpdate(e);
    };

    const connectionPromise = updatesConnection.connect({ query: { gameId, roomId }, recieve });

    const close = async () => {
      const c = await connectionPromise;
      c.close();
    };
    return { close };
  };
  const readAudio = async (gameId, roomId) => {
    const { body: { audio }} = await roomAudioResource.GET({ query: { roomId, gameId }});
    return audio || null;
  }
  const setAudio = async (gameId, roomId, audio) => {
    await roomAudioResource.PUT({ query: { roomId, gameId }, body: { audio }});
  };
  const readEncounter = async (gameId, roomId) => {
    const { body: { encounter }} = await roomEncounterResource.GET({ query: { roomId, gameId }});
    return encounter || null;
  }
  const setEncounter = async (gameId, roomId, encounter) => {
    await roomEncounterResource.PUT({ query: { roomId, gameId }, body: { encounter }});
  }
  const list = async (gameId) => {
    const { body: { rooms }} = await allTracksResource.GET({ query: { gameId }});
    return rooms;
  };
  const create = async (gameId, title) => {
    const { body: { room }} = await roomResource.POST({ body: { gameId, title }});
    return room;
  };
  const update = async (gameId, roomId, room) => {
    await roomResource.PUT({ query: { gameId, roomId }, body: { room } });
  };
  return {
    read,
    connectUpdates,
    readAudio,
    setAudio,
    readEncounter,
    setEncounter,
    list,
    create,
    update,
  };
};

/*::
export type RoomStateClient = {
  read: (gameId: GameID, roomId: RoomID) => Promise<RoomState>,
  update: (gameId: GameID, roomId: RoomID, updatedState: RoomState) => Promise<void>,

  connect: (gameId: GameID, roomId: string, onUpdate: (state: RoomState) => mixed) => Promise<{ close: () => Promise<void> }>,
};
*/
export const createRoomStateClient = (httpClient/*: HTTPClient*/, httpOrigin/*: string*/, wsOrigin/*: string*/)/*: RoomStateClient*/ => {
  const roomStateResource = createJSONResourceClient(roomAPI['/room/state'].resource, httpClient, httpOrigin);
  const roomStateConnection = createJSONConnectionClient(WebSocket, roomAPI['/room/state'].connection, wsOrigin);

  const read = async (gameId, roomId) => {
    const { body: { state }} = await roomStateResource.GET({ query: { roomId, gameId }});
    return state;
  };
  const update = async (gameId, roomId, updatedState) => {
    await roomStateResource.PUT({ query: { roomId, gameId }, body: { state: updatedState }});
  };
  const connect = async (gameId, roomId, onUpdate) => {
    const recieve = (message) => {
      switch (message.type) {
        case 'update':
          return void onUpdate(message.state);
      }
    };
    const { close } = await roomStateConnection.connect({ query: { gameId, roomId }, recieve })
    return { close };
  }

  return {
    read,
    update,
    connect,
  };
}