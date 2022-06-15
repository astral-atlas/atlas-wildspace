// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type {
  GameID, RoomID, Room, RoomState,
  RoomUpdate, EncounterState,
  RoomAudioState, EncounterAction,
  RoomPage,
} from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */
/*:: import type { HTTPServiceClient, WSServiceClient } from './wildspace.js'; */
/*::
import type { RoomStateClient } from './room/index.js';
import type { LobbyClient } from "./room/lobby";
import type { RoomSceneClient } from "./room/scene";
*/

import { createJSONResourceClient } from '@lukekaalim/http-client';
import { createJSONConnectionClient } from '@lukekaalim/ws-client';

import { roomAPI } from "@astral-atlas/wildspace-models";
import { createRoomStateClient } from "./room/index.js";
import { createLobbyClient } from './room/lobby.js';
import { createRoomSceneClient } from './room/scene.js';


/*::
export type RoomClient = {
  read: (gameId: GameID, roomId: RoomID) => Promise<Room>,
  destroy: (gameId: GameID, roomId: RoomID) => Promise<void>,

  connectUpdates: (gameId: GameID, roomId: RoomID, onUpdate: (state: RoomUpdate) => mixed) => { close: () => Promise<void> },
  
  readAudio: (gameId: GameID, roomId: RoomID) => Promise<RoomAudioState>,
  setAudio: (gameId: GameID, roomId: RoomID, audio: RoomAudioState) => Promise<void>,
  readEncounter: (gameId: GameID, roomId: RoomID) => Promise<null | EncounterState>,
  setEncounter: (gameId: GameID, roomId: RoomID, encounter: ?EncounterState) => Promise<void>,
  performEncounterActions: (gameId: GameID, roomId: RoomID, actions: EncounterAction[]) => Promise<void>,

  list: (gameId: GameID) => Promise<$ReadOnlyArray<Room>>,
  create: (gameId: GameID, title: string) => Promise<Room>,
  update: (gameId: GameID, roomId: RoomID, room: Room) => Promise<void>,

  getRoomPage: (gameId: GameID, roomId: RoomID) => Promise<RoomPage>,

  state: RoomStateClient,
  lobby: LobbyClient,
  scene: RoomSceneClient,
};
*/

export const createRoomClient = (http/*: HTTPServiceClient*/, ws/*: WSServiceClient*/)/*: RoomClient*/ => {
  const roomResource = http.createResource(roomAPI['/room']);
  const roomAudioResource = http.createResource(roomAPI['/room/audio']);
  const roomEncounterResource = http.createResource(roomAPI['/room/encounter']);
  const roomEncounterActionsResource = http.createResource(roomAPI['/room/encounter/actions']);
  const allTracksResource = http.createResource(roomAPI['/room/all']);
  const roomPageResource = http.createResource(roomAPI["/games/rooms/page"]);

  const updatesConnection = ws.createAuthorizedConnection(roomAPI['/room/updates']);

  const read = async (gameId, roomId) => {
    const { body: { room }} = await roomResource.GET({ query: { roomId, gameId }});
    return room;
  };
  const destroy = async (gameId, roomId) => {
    await roomResource.DELETE({ query: { roomId, gameId }});
  }
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
    const { body } = await roomAudioResource.GET({ query: { roomId, gameId }});
    if (body.type === 'not_found')
      throw new Error();
    return body.audio;
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
  const performEncounterActions = async (gameId, roomId, actions) => {
    await roomEncounterActionsResource.POST({ query: { roomId, gameId }, body: { actions }});
  };
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

  const getRoomPage = async (gameId, roomId) => {
    const { body: { roomPage } } = await roomPageResource.GET({ query: { gameId, roomId } })
    return roomPage;
  }

  const state = createRoomStateClient(http, ws);
  const lobby = createLobbyClient(http);
  const scene = createRoomSceneClient(http);

  return {
    read,
    destroy,
    connectUpdates,
    readAudio,
    setAudio,
    readEncounter,
    setEncounter,
    performEncounterActions,
    getRoomPage,
    
    list,
    create,
    update,
    state,
    lobby,
    scene,
  };
};
