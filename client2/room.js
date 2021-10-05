// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { GameID, RoomID, Room, RoomState } from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';
import { createJSONConnectionClient } from '@lukekaalim/ws-client';

import { roomAPI } from "@astral-atlas/wildspace-models";

/*::
export type RoomClient = {
  read: (gameId: GameID, roomId: RoomID) => Promise<Room>,
  list: (gameId: GameID) => Promise<$ReadOnlyArray<Room>>,
  create: (gameId: GameID, title: string) => Promise<Room>,
};
*/

export const createRoomClient = (httpClient/*: HTTPClient*/, baseURL/*: string*/)/*: RoomClient*/ => {
  const roomResource = createJSONResourceClient(roomAPI['/room'], httpClient, `http://${baseURL}`);
  const allTracksResource = createJSONResourceClient(roomAPI['/room/all'], httpClient, `http://${baseURL}`);

  const read = async (gameId, roomId) => {
    const { body: { room }} = await roomResource.GET({ query: { roomId, gameId }});
    return room;
  };
  const list = async (gameId) => {
    const { body: { rooms }} = await allTracksResource.GET({ query: { gameId }});
    return rooms;
  };
  const create = async (gameId, title) => {
    const { body: { room }} = await roomResource.POST({ body: { gameId, title }});
    return room;
  };
  return {
    read,
    list,
    create,
  };
};
/*::
export type RoomStateClient = {
  read: (gameId: GameID, roomId: RoomID) => Promise<RoomState>,
  update: (gameId: GameID, roomId: RoomID, updatedState: RoomState) => Promise<void>,

  connect: (gameId: GameID, roomId: string, onUpdate: (state: RoomState) => mixed) => Promise<{ close: () => Promise<void> }>,
};
*/
export const createRoomStateClient = (httpClient/*: HTTPClient*/, baseURL/*: string*/)/*: RoomStateClient*/ => {
  const roomStateResource = createJSONResourceClient(roomAPI['/room/state'].resource, httpClient, `http://${baseURL}`);
  const roomStateConnection = createJSONConnectionClient(WebSocket, roomAPI['/room/state'].connection, `ws://${baseURL}`);

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