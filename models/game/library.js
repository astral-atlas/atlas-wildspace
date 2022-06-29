// @flow strict
/*::
import type { AssetInfo } from "../asset";
import type { AudioPlaylist, AudioTrack } from "../audio";
import type { Character, Monster } from "../character";
import type { MonsterActor } from "../monster/monsterActor";
import type { Room } from "../room/room";
import type { Exposition } from "./exposition";
import type { Location } from "./location";
import type { MiniTheater } from "./miniTheater";
import type { Scene } from "./scene";
import type { Cast } from "@lukekaalim/cast/main";
*/

import { castAssetInfo } from "../asset.js";
import { castAudioPlaylist, castAudioTrack } from "../audio.js";
import { castMonster } from "../character.js";
import { castCharacter } from "../character.js";
import { castMonsterActor } from "../monster/monsterActor.js";
import { castRoom } from "../room/room.js";
import { castExposition } from "./exposition.js";
import { castLocation } from "./location.js";
import {
  castMiniTheater,
} from "./miniTheater.js";
import { castScene } from "./scene.js";
import { c } from "@lukekaalim/cast";

/*::
export type LibraryData = {|
  rooms: $ReadOnlyArray<Room>,

  characters: $ReadOnlyArray<Character>,
  monsters: $ReadOnlyArray<Monster>,

  monsterActors: $ReadOnlyArray<MonsterActor>,

  miniTheaters: $ReadOnlyArray<MiniTheater>,
  scenes: $ReadOnlyArray<Scene>,
  expositions: $ReadOnlyArray<Exposition>,

  locations: $ReadOnlyArray<Location>,

  tracks: $ReadOnlyArray<AudioTrack>,
  playlists: $ReadOnlyArray<AudioPlaylist>,

  assets: $ReadOnlyArray<AssetInfo>,
|};
*/
export const castLibraryData/*: Cast<LibraryData>*/ = c.obj({
  rooms: c.arr(castRoom),
  characters: c.arr(castCharacter),
  monsters: c.arr(castMonster),

  monsterActors: c.arr(castMonsterActor),

  miniTheaters: c.arr(castMiniTheater),
  scenes: c.arr(castScene),
  expositions: c.arr(castExposition),
  locations: c.arr(castLocation),

  tracks: c.arr(castAudioTrack),
  playlists: c.arr(castAudioPlaylist),

  assets: c.arr(castAssetInfo),
});

/*::
export type LibraryEvent =
  | {
      type: 'rooms',
      rooms: $ReadOnlyArray<Room>,
    }
  | {
      type: 'characters',
      characters: $ReadOnlyArray<Character>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'monsters',
      monsters: $ReadOnlyArray<Monster>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'monster-actors',
      monsterActors: $ReadOnlyArray<MonsterActor>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'mini-theaters',
      miniTheaters: $ReadOnlyArray<MiniTheater>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'scenes',
      scenes: $ReadOnlyArray<Scene>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'expositions',
      expositions: $ReadOnlyArray<Exposition>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'locations',
      locations: $ReadOnlyArray<Location>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'audio-tracks',
      tracks: $ReadOnlyArray<AudioTrack>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
  | {
      type: 'audio-playlists',
      playlists: $ReadOnlyArray<AudioPlaylist>,
      assets: $ReadOnlyArray<AssetInfo>,
    }
*/

export const castLibraryEvent/*: Cast<LibraryEvent>*/ = c.or('type', {
  'rooms': c.obj({
    type: c.lit('rooms'),
    rooms: c.arr(castRoom),
  }),
  'characters': c.obj({
    type: c.lit('characters'),
    characters: c.arr(castCharacter),
    assets: c.arr(castAssetInfo),
  }),
  'monsters': c.obj({
    type: c.lit('monsters'),
    monsters: c.arr(castMonster),
    assets: c.arr(castAssetInfo),
  }),
  'monster-actors': c.obj({
    type: c.lit('monster-actors'),
    monsterActors: c.arr(castMonsterActor),
    assets: c.arr(castAssetInfo),
  }),
  'mini-theaters': c.obj({
    type: c.lit('mini-theaters'),
    miniTheaters: c.arr(castMiniTheater),
    assets: c.arr(castAssetInfo),
  }),
  'expositions': c.obj({
    type: c.lit('expositions'),
    expositions: c.arr(castExposition),
    assets: c.arr(castAssetInfo),
  }),
  'scenes': c.obj({
    type: c.lit('scenes'),
    scenes: c.arr(castScene),
    assets: c.arr(castAssetInfo),
  }),
  'locations': c.obj({
    type: c.lit('locations'),
    locations: c.arr(castLocation),
    assets: c.arr(castAssetInfo),
  }),
  'audio-tracks': c.obj({
    type: c.lit('audio-tracks'),
    tracks: c.arr(castAudioTrack),
    assets: c.arr(castAssetInfo),
  }),
  'audio-playlists': c.obj({
    type: c.lit('audio-playlists'),
    playlists: c.arr(castAudioPlaylist),
    assets: c.arr(castAssetInfo),
  }),
});

export const reduceLibraryEvent = (data/*: LibraryData*/, event/*: LibraryEvent*/)/*: LibraryData*/ => {
  switch (event.type) {
    case 'rooms':
      return {
        ...data,
        rooms: event.rooms,
      };
    case "mini-theaters":
      return {
        ...data,
        miniTheaters: event.miniTheaters,
        assets: [...data.assets, ...event.assets],
      };
    case 'characters':
      return {
        ...data,
        characters: event.characters,
        assets: [...data.assets, ...event.assets],
      };
    case 'monsters':
      return {
        ...data,
        monsters: event.monsters,
        assets: [...data.assets, ...event.assets],
      };
    case 'monster-actors':
      return {
        ...data,
        monsterActors: event.monsterActors,
        assets: [...data.assets, ...event.assets],
      };
    case 'scenes':
      return {
        ...data,
        scenes: event.scenes,
        assets: [...data.assets, ...event.assets],
      };
    case 'expositions':
      return {
        ...data,
        expositions: event.expositions,
        assets: [...data.assets, ...event.assets],
      };
    case 'locations':
      return {
        ...data,
        locations: event.locations,
        assets: [...data.assets, ...event.assets],
      };
    case 'audio-tracks':
      return {
        ...data,
        tracks: event.tracks,
        assets: [...data.assets, ...event.assets],
      };
    case 'audio-playlists':
      return {
        ...data,
        playlists: event.playlists,
        assets: [...data.assets, ...event.assets],
      };
    default:
      return data;
  }
}