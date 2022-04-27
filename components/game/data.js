// @flow strict

import { useState, useEffect, useMemo } from "@lukekaalim/act"

/*::
import type { GameUpdateTimes } from "../utils/updates";
import type {
  GameID, Game,
  Player,
  AudioPlaylist, AudioTrack,
  ExpositionScene,
  Location,
  Room,
  AssetID, AssetInfo,
} from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { AssetDownloadURLMap } from "../asset/map";
import type { UserID } from "@astral-atlas/sesame-models/src/user";

export type GameData = {|
  game: Game,
  userId: UserID,
  isGameMaster: boolean,
  ...GameAssetData,
|};
export type GameAssetData = {|
  rooms: $ReadOnlyArray<Room>,
  players: $ReadOnlyArray<Player>,
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks: $ReadOnlyArray<AudioTrack>,
  locations: $ReadOnlyArray<Location>,
  scenes: {
    exposition: $ReadOnlyArray<ExpositionScene>,
  },
  assets: AssetDownloadURLMap
|}
*/

const emptyGameData = {
  rooms: [],
  players: [],
  playlists: [],
  tracks: [],
  locations: [],
  scenes: {
    exposition: []
  },
  assets: new Map(),
}

export const useGameData = (
  game/*: Game*/,
  userId/*: UserID*/,
  times/*: GameUpdateTimes*/,
  client/*: WildspaceClient*/
)/*: GameData*/ => {
  const [data, setData] = useState/*:: <GameAssetData>*/(emptyGameData)

  const updateData = (nextData, nextAssets = []) => {
    setData(d => ({
      ...d,
      ...nextData,
      scenes: nextData.scenes ? { ...d.scenes, ...nextData.scenes } : d.scenes,
      assets: new Map([ ...d.assets, ...nextAssets])
    }))
  }
  
  useEffect(() => {
    client.audio.playlist.list(game.id)
      .then(playlists => updateData({ playlists }))
  }, [times.playlists])
  useEffect(() => {
    client.audio.tracks.list(game.id)
      .then(([tracks, relatedAssets]) => updateData({ tracks }, relatedAssets))
  }, [times.tracks])
  useEffect(() => {
    client.game.location.list(game.id)
      .then(([locations, relatedAssets]) => updateData({ locations }, relatedAssets))
  }, [times.locations])
  useEffect(() => {
    client.game.scene.list(game.id)
      .then(exposition => updateData({ scenes: { exposition } }))
  }, [times.scenes])
  useEffect(() => {
    client.game.players.list(game.id)
      .then(players => updateData({ players }))
  }, [times.players])
  useEffect(() => {
    client.room.list(game.id)
      .then(rooms => updateData({ rooms }))
  }, [times.rooms])

  const memoData = useMemo(() => ({
    ...data,
    userId,
    game,
    isGameMaster: game.gameMasterId === userId
  }), [data, game, userId])

  return memoData;
}