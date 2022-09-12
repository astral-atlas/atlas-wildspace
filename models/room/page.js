// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";

import type { AudioPlaylist, AudioTrack } from "../audio";
import type { Character } from "../character";
import type { Exposition } from "../game/exposition";
import type { Location } from "../game/location";
import type { Scene } from "../game/scene";
import type { MonsterActorID, MonsterActorMask } from "../monster/monsterActor";
import type { RoomState } from "./state";
import type { AssetInfo } from "../asset";
import type { Room } from "./room";
import type { GameConnectionID } from "../game/connection";
import type { RoomResources } from "./resources";
*/

import { c } from "@lukekaalim/cast";
import { castUserId } from "@astral-atlas/sesame-models";

import { castRoomState } from "./state.js";
import { castRoom } from "./room.js";
import { castGameConnectionId } from "../game/connection.js";
import { castRoomResources } from "./resources.js";
import { castAssetInfo } from "../asset.js";

/*::
export type RoomPage = {
  room: Room,
  state: RoomState,
  
  connections: $ReadOnlyArray<{|
    id: GameConnectionID,
    userId: UserID
  |}>,

  resources: RoomResources,
  assets: $ReadOnlyArray<AssetInfo>,
};
*/

export const castRoomPage/*: Cast<RoomPage>*/ = c.obj({
  room: castRoom,
  state: castRoomState,

  connections: c.arr(c.obj({
    id: castGameConnectionId,
    userId: castUserId,
  })),

  resources: castRoomResources,
  assets: c.arr(castAssetInfo),
});


/*::
export type RoomPageEvent =
  | { type: 'connection-update', connections: $ReadOnlyArray<{|
      id: GameConnectionID,
      userId: UserID
    |}> }
  | { type: 'next-page', page: RoomPage }
  | { type: 'next-state', roomState: RoomState }
*/

export const castRoomPageEvent/*: Cast<RoomPageEvent>*/ = c.or('type', {
  'next-page': c.obj({
    type: c.lit('next-page'),
    page: castRoomPage
  }),
  'next-state': c.obj({
    type: c.lit('next-state'),
    roomState: castRoomState
  }),
  'connection-update': c.obj({
    type: c.lit('connection-update'),
    connections: c.arr(c.obj({ id: castGameConnectionId, userId: castUserId }))
  }),
})

export const reduceRoomPageEvent = (roomPage/*: RoomPage*/, event/*: RoomPageEvent*/)/*: RoomPage*/ => {
  switch (event.type) {
    case 'connection-update':
      return { ...roomPage, connections: event.connections };
    case 'next-page':
      return event.page;
    case 'next-state':
      return { ...roomPage, state: event.roomState };
    default:
      return roomPage;
  }
}