// @flow strict

import { useState, useEffect, useMemo } from "@lukekaalim/act"

/*::
import type { GameUpdateTimes } from "../utils/updates";
import type {
  GameID, Game, GameConnectionID,
  Player,
  AudioPlaylist, AudioTrack,
  Scene,
  Exposition,
  Location,
  Room,
  AssetID, AssetInfo,
  WikiDoc,
  Character
} from "@astral-atlas/wildspace-models";
import type { WildspaceClient, WikiConnectionClient } from "@astral-atlas/wildspace-client2";
import type { AssetDownloadURLMap } from "../asset/map";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
import type { MagicItem } from "../../models/game/magicItem";
import type { MiniTheater } from "../../models/game/miniTheater";

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
  characters: $ReadOnlyArray<Character>,
  magicItems: $ReadOnlyArray<MagicItem>,
  wikiDocs: $ReadOnlyArray<WikiDoc>,
  scenes: $ReadOnlyArray<Scene>,
  expositions: $ReadOnlyArray<Exposition>,
  miniTheaters: $ReadOnlyArray<MiniTheater>,
  assets: AssetDownloadURLMap
|}
*/
import { useConnection } from "../utils/connect";

const emptyGameData = {
  rooms: [],
  players: [],
  playlists: [],
  tracks: [],
  locations: [],
  magicItems: [],
  characters: [],
  wikiDocs: [],
  scenes: [],
  miniTheaters: [],
  expositions: [],
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
    client.game.scene.read(game.id)
      .then(scenes => updateData({ scenes }))
  }, [times.scenes])
  useEffect(() => {
    client.game.exposition.read(game.id)
      .then(expositions => updateData({ expositions }))
  }, [times.exposition])
  useEffect(() => {
    client.game.players.list(game.id)
      .then(players => updateData({ players }))
  }, [times.players])
  useEffect(() => {
    client.room.list(game.id)
      .then(rooms => updateData({ rooms }))
  }, [times.rooms])
  useEffect(() => {
    client.game.magicItem.list(game.id)
      .then(magicItems => updateData({ magicItems }))
  }, [times.magicItems])
  useEffect(() => {
    client.game.wiki.read(game.id)
      .then(wikiDocs => updateData({ wikiDocs }))
  }, [times.wikiDoc])
  useEffect(() => {
    client.game.character.listAdvanced(game.id)
      .then(([characters, relatedAssets]) => updateData({ characters }, relatedAssets))
  }, [times.characters])
  useEffect(() => {
    client.game.miniTheater.read(game.id)
      .then((miniTheaters) => updateData({ miniTheaters }))
  }, [times.miniTheater])

  const memoData = useMemo(() => ({
    ...data,
    userId,
    game,
    isGameMaster: game.gameMasterId === userId
  }), [data, game, userId])

  return memoData;
}

export const useGameConnection = (
  api/*: WildspaceClient*/,
  gameId/*: GameID*/,
)/*: [GameUpdateTimes, ?WikiConnectionClient, ?GameConnectionID]*/ => {
  const [updateTimes, setUpdateTimes] = useState/*:: <GameUpdateTimes>*/({
    rooms: 0,
    players: 0,
    tracks: 0,
    playlists: 0,
    scenes: 0,
    characters: 0,
    locations: 0,
    magicItems: 0,
    wikiDoc: 0,
    exposition: 0,
    miniTheater: 0,
  });
  const [connectionId, setConncetionId] = useState(null);
  const [wiki, setWiki] = useState();

  useConnection(async () => {
    const { close, wiki } = await api.game.connectUpdates(gameId, update => {
      switch (update.type) {
        case 'rooms':
          return setUpdateTimes(t => ({ ...t, rooms: Date.now() }))
        case 'players':
          return setUpdateTimes(t => ({ ...t, players: Date.now() }))
        case 'tracks':
          return setUpdateTimes(t => ({ ...t, tracks: Date.now() }))
        case 'playlists':
          return setUpdateTimes(t => ({ ...t, playlists: Date.now() }))
        case 'scenes':
          return setUpdateTimes(t => ({ ...t, scenes: Date.now() }))
        case 'locations':
          return setUpdateTimes(t => ({ ...t, locations: Date.now() }))
        case 'magicItem':
          return setUpdateTimes(t => ({ ...t, magicItems: Date.now() }))
        case 'wikiDoc':
          return setUpdateTimes(t => ({ ...t, wikiDoc: Date.now() }))
        case 'characters':
          return setUpdateTimes(t => ({ ...t, characters: Date.now() }))
        case 'exposition':
          return setUpdateTimes(t => ({ ...t, exposition: Date.now() }))
        case 'mini-theater':
          return setUpdateTimes(t => ({ ...t, miniTheater: Date.now() }))
      }
    }, connectionId => setConncetionId(connectionId))
    setWiki(wiki);
    return close;
  }, [gameId])
  
  return [updateTimes, wiki, connectionId];
};