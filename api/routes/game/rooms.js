// @flow strict
/*::
import type { RoutesConstructor } from "../../routes";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createCRUDConstructors } from "../meta.js";
import { v4 as uuid } from "uuid";

export const createGameRoomsRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const gameRoomRoutes = createGameCRUDRoutes(gameAPI["/games/rooms"], {
    name: 'room',
    idName: 'roomId',
    async create({ game, body: { room: { hidden, title } } }) {
      const roomId = uuid();
      const room = {
        id: roomId,
        gameId: game.id,
        hidden,
        title,
      };
      await services.data.roomData.rooms.set(game.id, roomId, room);
      return room;
    },
    async read({ game, grant }) {
      const { result: rooms } = await services.data.roomData.rooms.query(game.id);
      if (grant.id === game.gameMasterId)
        return rooms;
      return rooms.filter(room => !room.hidden);
    },
    async update({ game, query: { roomId }, body: { room: { title, hidden } } }) {
      const { result: room } = await services.data.roomData.rooms.get(game.id, roomId);
      if (!room)
        throw new Error();
      const nextRoom = {
        ...room,
        title,
        hidden,
      }

      await services.data.roomData.rooms.set(game.id, roomId, nextRoom);
      return nextRoom;
    },
    async destroy({ game, query: { roomId } }) {
      await services.data.roomData.rooms.set(game.id, roomId, null);
    }
  });

  const http = [
    ...gameRoomRoutes,
  ];
  const ws = [

  ];
  return { http, ws }
}