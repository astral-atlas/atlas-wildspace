// @flow strict
import { c } from "@lukekaalim/cast";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castRoom } from "../../room/room.js";

/*::
import type { Room, RoomID } from "../../room/room";
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description/resource";

export type GameRoomsAPI = {|
  '/games/rooms': AdvancedGameCRUDAPI<{
    resource: Room,
    resourceName: 'room',
    resourceId: RoomID,
    resourceIdName: 'roomId',
  
    resourcePostInput: { hidden: boolean, title: string },
    resourcePutInput: Room,
  }>,
|};
*/

export const gamesRooms/*: ResourceDescription<GameRoomsAPI['/games/rooms']>*/ = createAdvancedCRUDGameAPI({
  path: '/games/rooms',
  castResource: castRoom,
  resourceName: 'room',
  resourceIdName: 'roomId',
  castPostResource: c.obj({ hidden: c.bool, title: c.str }),
  castPutResource: castRoom,
})

export const gamesRoomsAPI = {
  '/games/rooms': gamesRooms,
}