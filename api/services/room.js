// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type {
  RoomID, GameID, RoomPage, GameConnectionID,
  RoomResources, RoomState, RoomStateAction
} from '@astral-atlas/wildspace-models';
import type { WildspaceData } from '@astral-atlas/wildspace-data';

import type { AssetService } from "./asset";
import type { GameService } from "./game";
import type { RoomConnectionService } from "./room/connection";
*/

import { v4 as uuid } from 'uuid';
import { 
  createDefaultRoomState,
  emptyRoomResources,
  mergeRoomResources,
  reduceRoomState,
} from "@astral-atlas/wildspace-models";
import { createRoomConnectionService } from './room/connection.js';

/*::
export type RoomService = {
  connection: RoomConnectionService,
  subscribeRoomStateUpdate: (
    gameId: GameID,
    roomId: RoomID,
    onStateUpdate: () => mixed,
  ) => { unsubscribe: () => void },
  submitAction: (gameId: GameID, roomId: RoomID, action: RoomStateAction) => Promise<void>,
  getResources: (gameId: GameID, roomId: RoomID, roomState: RoomState) => Promise<RoomResources>,
  getState: (gameId: GameID, roomId: RoomID) => Promise<RoomState>,
};
*/

export const createRoomService = (
  data/*: WildspaceData*/,
  asset/*: AssetService*/,
  game/*: GameService*/,
)/*: RoomService*/ => {
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
  const getExpositionBackgroundResources = async (gameId, background) => {
    switch (background.type) {
      case 'mini-theater':
        return getMiniTheaterResources(gameId, background.miniTheaterId);
      default:
        return null;
    }
  }
  const getMiniTheaterResources = async (gameId, miniTheaterId) => {
    const { results: modelResourceResults } = await data.gameData.resources.models.query(gameId);
    const { results: terrainPropsResults } = await data.gameData.miniTheater.terrainProps.query(gameId);
    const modelResources = modelResourceResults.map(r => r.result)
    const terrainProps = terrainPropsResults.map(r => r.result)
    return { ...emptyRoomResources, modelResources, terrainProps }
  }
  const getSceneResources = async (gameId, roomId, sceneState) => {
    const { content } = sceneState;
    switch (content.type) {
      case 'exposition':
        return await mergeResourcePromises([
          getExpositionSubjectResources(gameId, content.exposition.subject),
          getExpositionBackgroundResources(gameId, content.exposition.background),
        ]);
      case 'mini-theater':
        return await getMiniTheaterResources(gameId, content.miniTheaterId)
      case 'none':
      default:
        return null;
    }
  }
  const getResources = async (gameId, roomId, state) => {
    return mergeResourcePromises([
      getAudioResources(gameId, roomId, state.audio),
      getSceneResources(gameId, roomId, state.scene),
    ]);
  }
  const getState = async (gameId, roomId) => {
    const { result } = await data.roomData.roomStates.table.get(gameId, roomId);
    return result || createDefaultRoomState(roomId);
  }
  const submitAction = async (gameId, roomId, action) => {
    try {
      const { result: state } = await data.roomData.roomStates.table.get(gameId, roomId)
      if (!state) {
        const defaultState = createDefaultRoomState(roomId);
        const nextRoomState = reduceRoomState(defaultState, action)
        await data.roomData.roomStates.table.set(gameId, roomId, nextRoomState);
        data.roomData.roomStateUpdates.publish(roomId, {});
        data.gameData.gameDataEvent.publish(gameId, 'room-state')
      } else {
        const { next } = await data.roomData.roomStates.transactable
          .transaction(gameId, roomId, prevState => {
            return reduceRoomState(prevState, action)
          }, 5);
        console.log(next.scene.content.type);
        data.roomData.roomStateUpdates.publish(roomId, {});
        data.gameData.gameDataEvent.publish(gameId, 'room-state')
      }

    } catch (error) {
      console.error(error);
    }
  }
  const subscribeRoomStateUpdate = (gameId, roomId, onUpdate) => {
    const { unsubscribe } = data.roomData.roomStateUpdates.subscribe(roomId,  () => {
      onUpdate()
    })
    return { unsubscribe }
  }

  return {
    connection: createRoomConnectionService(data),
    subscribeRoomStateUpdate,
    getResources,
    getState,
    submitAction,
  }
}