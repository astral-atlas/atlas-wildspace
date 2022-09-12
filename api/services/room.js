// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { RoomID, GameID, RoomPage, GameConnectionID, RoomResources, RoomState } from '@astral-atlas/wildspace-models';
import type { WildspaceData } from '@astral-atlas/wildspace-data';

import type { AssetService } from "./asset";
import type { GameService } from "./game";
import type { RoomConnectionService } from "./room/connection";
*/

import { v4 as uuid } from 'uuid';
import { 
  emptyRoomResources,
  mergeRoomResources,
} from "@astral-atlas/wildspace-models";
import { createRoomConnectionService } from './room/connection.js';

/*::
export type RoomService = {
  connection: RoomConnectionService,
  getResources: (gameId: GameID, roomId: RoomID, roomState: RoomState) => Promise<RoomResources>,
  getState: (gameId: GameID, roomId: RoomID) => Promise<RoomState>,
};
*/

export const createRoomService = (
  data/*: WildspaceData*/,
  asset/*: AssetService*/,
  game/*: GameService*/,
)/*: RoomService*/ => {
  const createDefaultRoomState = (gameId, roomId) => {
    return {
      version: uuid(),
      roomId,
    
      audio: { volume: 0, playback: { type: 'none' } },
      scene: { content: { type: 'none' } },
    }
  }
  const mergeResourcePromises = async (resourcePromises/*: Array<Promise<?RoomResources>>*/) => {
    const allResources = await Promise.all(resourcePromises)
    return allResources
      .filter(Boolean)
      .reduce(mergeRoomResources, emptyRoomResources)
  }
  const getAudioResources = async (gameId, roomId, audioState)/*: Promise<?RoomResources>*/ => {
    const { playback } = audioState;
    switch (playback.type) {
      case 'playlist':
        const { result: playlist } = await data.playlists.get(gameId, playback.playlist.id);
        if (!playlist)
          return null;
        const { result: allTracks } = await data.tracks.query(gameId);
        const trackMap = new Map(allTracks.map(t => [t.id, t]));
        const playlistTracks = playlist.trackIds
          .map(trackId => trackMap.get(trackId))
          .filter(Boolean)
        return {
          ...emptyRoomResources,
          audioPlaylists: [playlist],
          audioTracks: playlistTracks
        };
      default:
      case 'none':
        return null;
    }
  }
  const getExpositionSubjectResources = async (gameId, subject) => {
    switch (subject.type) {
      case 'location':
        const { result: location } = await data.gameData.locations.get(gameId, subject.locationId);
        if (!location)
          return null;
        return {
          ...emptyRoomResources,
          locations: [location],
        }
      default:
      case 'npc':
      case 'none':
        return null;
    }
  }
  const getSceneResources = async (gameId, roomId, sceneState) => {
    const { content } = sceneState;
    switch (content.type) {
      case 'exposition':
        return getExpositionSubjectResources(gameId, content.exposition.subject);
      case 'mini-theater':
      case 'none':
      default:
        return null;
    }
  }
  const getResources = async (gameId, roomId, state) => {
    return mergeResourcePromises([
      getAudioResources(gameId, roomId, state.audio),
      getSceneResources(gameId, roomId, state.scene)
    ]);
  }
  const getState = async (gameId, roomId) => {
    const { result } = await data.roomData.roomStates.table.get(gameId, roomId);
    return result || createDefaultRoomState(gameId, roomId);
  }

  return {
    connection: createRoomConnectionService(data),
    getResources,
    getState,
  }
}