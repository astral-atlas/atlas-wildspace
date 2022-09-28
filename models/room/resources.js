// @flow strict

import { c } from "@lukekaalim/cast";
import { castLocation } from "../game/location.js";
import { castNonPlayerCharacter } from "../game/character.js";
import { castAudioTrack, castAudioPlaylist } from "../audio.js";
import { castAssetInfo } from "../asset.js";
import { castTerrainProp } from "../game/miniTheater/terrain.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { NonPlayerCharacter } from "../game/character";
import type { Location } from "../game/location";
import type { AudioPlaylist, AudioTrack } from "../audio";
import type { AssetID, AssetInfo } from "../asset";
import type { TerrainProp } from "../game/miniTheater/terrain";

export type RoomResources = {
  locations:      $ReadOnlyArray<Location>,
  npcs:           $ReadOnlyArray<NonPlayerCharacter>,
  terrainProps:   $ReadOnlyArray<TerrainProp>,
  audioTracks:    $ReadOnlyArray<AudioTrack>,
  audioPlaylists: $ReadOnlyArray<AudioPlaylist>,
};
*/

export const castRoomResources/*: Cast<RoomResources>*/ = c.obj({
  locations:      c.arr(castLocation),
  npcs:           c.arr(castNonPlayerCharacter),
  terrainProps:   c.arr(castTerrainProp),
  audioTracks:    c.arr(castAudioTrack),
  audioPlaylists: c.arr(castAudioPlaylist),
});

const merge = /*:: <T>*/(
  a/*: $ReadOnlyArray<T>*/,
  b/*: $ReadOnlyArray<T>*/,
  getId/*: T => string*/
)/*: T[]*/ => {
  const combinedArray = [...a, ...b];
  const mapEntries = combinedArray.map(x => [getId(x), x]);
  const map = new Map(mapEntries);
  const mergedValues = [...map.values()];
  return mergedValues;
}

export const mergeRoomResources = (a/*: RoomResources*/, b/*: RoomResources*/)/*: RoomResources*/ => ({
  locations:      merge(a.locations,      b.locations,      l => l.id),
  npcs:           merge(a.npcs,           b.npcs,           n => n.id),
  audioTracks:    merge(a.audioTracks,    b.audioTracks,    t => t.id),
  audioPlaylists: merge(a.audioPlaylists, b.audioPlaylists, p => p.id),
})

export const emptyRoomResources/*: RoomResources*/ = {
  locations:      [],
  npcs:           [],
  audioTracks:    [],
  audioPlaylists: [],
};

export const getRoomResourcesAssetIds = (resources/*: RoomResources*/)/*: AssetID[]*/ => {
  return [
    ...resources.locations.map((l) => {
      switch (l.background.type) {
        case 'image':
          return l.background.imageAssetId;
        default:
          return null;
      }
    }),
    ...resources.audioTracks.map((a) => {
      return [
        a.trackAudioAssetId,
        a.coverImageAssetId,
      ]
    }).flat(1),
    ...resources.npcs.map((n) => {
      switch (n.dialoguePortrait.type) {
        case 'image':
          return n.dialoguePortrait.imageAssetId;
        default:
          return null;
      }
    }),
  ].filter(Boolean)
}