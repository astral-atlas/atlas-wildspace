// @flow strict
/*::
import type { RoomID, GameID, RoomUpdate, RoomPage } from '@astral-atlas/wildspace-models';
import type { WildspaceData } from '@astral-atlas/wildspace-data';

import type { AssetService } from "./asset";
*/

import { createMaskForMonsterActor } from "@astral-atlas/wildspace-models";

/*::
export type RoomService = {
  getRoomPage: (gameId: GameID, roomId: RoomID) => Promise<?RoomPage>
};
*/

export const createRoomService = (
  data/*: WildspaceData*/,
  asset/*: AssetService*/
)/*: RoomService*/ => {
  const getRoomPage = async (gameId, roomId) => {
    const [
      { result: room },
      { result: sceneState },
      { result: audioState },
      { result: lobbyState },
      { result: monsters },
      { result: allScenes },
      { result: characters },
      { result: monsterActors },
      { result: allLocations },
      { result: allExposisions },
      { result: allPlaylists },
      { result: allTracks },
    ] = await Promise.all([
      data.room.get(gameId, roomId),
      data.roomData.scene.get(gameId, roomId),
      data.roomAudio.get(gameId, roomId),
      data.roomData.lobby.get(gameId, roomId),

      data.monsters.query(gameId),
      data.gameData.scenes.query(gameId),
      data.characters.query(gameId),
      data.gameData.monsterActors.query(gameId),
      data.gameData.locations.query(gameId),
      data.gameData.expositions.query(gameId),

      data.playlists.query(gameId),
      data.tracks.query(gameId),
    ]);
    if (!room)
      return null;

    const state = {
      roomId: room.id,
      audio: audioState || { playback: { type: 'none' }, volume: 0 },
      scene: sceneState || { activeScene: null },
      lobby: lobbyState || { messages: [], playersConnected: [] },
    }

    const sceneMap = new Map(allScenes.map(s => [s.id, s]));
    const monsterMap = new Map(monsters.map(m => [m.id, m]));
    const expositionMap = new Map(allExposisions.map(e => [e.id, e]))
    const locationMap = new Map(allLocations.map(l => [l.id, l]))
    const playlistMap = new Map(allPlaylists.map(p => [p.id, p]))
    const trackMap = new Map(allTracks.map(t => [t.id, t]))

    const monsterMasks = monsterActors.map(actor => {
      const monster = monsterMap.get(actor.monsterId);
      if (!monster)
        return null;
      return createMaskForMonsterActor(monster, actor);
    }).filter(Boolean);
    const scene = state.scene.activeScene && sceneMap.get(state.scene.activeScene) || null;
    const expositions = [
      (scene && scene.content.type === 'exposition') ? expositionMap.get(scene.content.expositionId) : null
    ].filter(Boolean);
    const locations = [
      ...expositions
        .map(exposition => exposition.subject.type === "location" ? exposition.subject : null)
        .filter(Boolean)
        .map(subject => locationMap.get(subject.locationId)),
    ].filter(Boolean);

    const playlist = state.audio.playback.type === 'playlist' && playlistMap.get(state.audio.playback.playlist.id) || null;
    const tracks = [
      ...(playlist ? playlist.trackIds.map(trackId => trackMap.get(trackId)) : [])
        .filter(Boolean)
    ];

    const assets = [
      ...(await Promise.all(characters
        .map(character => character.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => asset.peek(assetId))
      )),
      ...(await Promise.all(monsters
        .map(monster => monster.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => asset.peek(assetId))
      )),
      ...(await Promise.all(locations
        .map(l => l.background.type === 'image' ? l.background.imageAssetId : null)
        .filter(Boolean)
        .map(imageAssetId => asset.peek(imageAssetId))
      ))
    ].filter(Boolean);

    const roomPage = {
      room,
      state,

      characters,
      monsterMasks,
      
      scene,
      locations,
      expositions,

      playlist,
      tracks,

      assets,
    };
    return roomPage;
  };

  return {
    getRoomPage,
  }
}