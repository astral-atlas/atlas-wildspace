// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";

import type { AudioPlaylist, AudioTrack } from "../audio";
import type { Character } from "../character";
import type { Exposition } from "../game/exposition";
import type { Location } from "../game/location";
import type { Scene } from "../game/scene";
import type { MonsterActorID, MonsterActorMask } from "../monster/monsterActor";
import type { RoomState } from "./state";
import type { AssetInfo } from "../asset";
import type { Room } from "./room";
*/

import { c } from "@lukekaalim/cast";

import { castRoomState } from "./state.js";
import { castLocation, castExposition, castScene } from "../game.js";
import { castAudioPlaylist, castAudioTrack } from "../audio.js";
import { castAssetInfo } from "../asset.js";
import {
  castMonsterActorId,
  castMonsterActorMask,
} from "../monster/monsterActor.js";
import { castCharacter } from "../character.js";
import { castRoom } from "./room.js";


/*::
export type RoomPage = {
  room: Room,
  state: RoomState,

  scene:        ?Scene,
  locations:    $ReadOnlyArray<Location>,
  expositions:  $ReadOnlyArray<Exposition>,

  tracks:       $ReadOnlyArray<AudioTrack>,
  playlist:     ?AudioPlaylist,

  assets:       $ReadOnlyArray<AssetInfo>,
};
*/

export const castRoomPage/*: Cast<RoomPage>*/ = c.obj({
  room: castRoom,
  state: castRoomState,

  locations: c.arr(castLocation),
  expositions: c.arr(castExposition),
  scene: c.maybe(castScene),

  tracks: c.arr(castAudioTrack),
  playlist: c.maybe(castAudioPlaylist),

  assets: c.arr(castAssetInfo)
});


/*::
export type RoomPageEvent =
  | { type: 'next-page', page: RoomPage }
*/

export const castRoomPageEvent/*: Cast<RoomPageEvent>*/ = c.or('type', {
  'next-page': c.obj({
    type: c.lit('next-page'),
    page: castRoomPage
  }),
})

export const reduceRoomPageEvent = (roomPage/*: RoomPage*/, event/*: RoomPageEvent*/)/*: RoomPage*/ => {
  switch (event.type) {
    case 'next-page':
      return event.page;
  }
}