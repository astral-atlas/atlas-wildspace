// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { RoomID, GameID, RoomUpdate, RoomPage, GameConnectionID } from '@astral-atlas/wildspace-models';
import type { WildspaceData } from '@astral-atlas/wildspace-data';

import type { AssetService } from "./asset";
import type { GameService } from "./game";

*/

import { v4 as uuid } from 'uuid';
import { createMaskForMonsterActor } from "@astral-atlas/wildspace-models";

/*::
export type RoomService = {
  getRoomPage: (gameId: GameID, roomId: RoomID) => Promise<?RoomPage>,

  connect: (gameId: GameID, roomId: RoomID, userId: UserID, connectionId: GameConnectionID) => () => void,
};
*/

export const createRoomService = (
  data/*: WildspaceData*/,
  asset/*: AssetService*/,
  game/*: GameService*/,
)/*: RoomService*/ => {
  const getRoomPage = async (gameId, roomId) => {
    const [
      { result: room },
      { result: sceneState },
      { result: audioState },
      { result: lobbyData },
      { result: allScenes },
      { result: allLocations },
      { result: allExposisions },
      { result: allPlaylists },
      { result: allTracks },
      validConnections,
    ] = await Promise.all([
      data.room.get(gameId, roomId),
      data.roomData.scene.get(gameId, roomId),
      data.roomAudio.get(gameId, roomId),
      data.roomData.lobby.get(gameId, roomId),

      data.gameData.scenes.query(gameId),
      data.gameData.locations.query(gameId),
      data.gameData.expositions.query(gameId),

      data.playlists.query(gameId),
      data.tracks.query(gameId),

      game.connection.getValidConnections(gameId, Date.now()),
    ]);
    if (!room)
      return null;

    const state = {
      roomId: room.id,
      audio: audioState || { playback: { type: 'none' }, volume: 0 },
      scene: sceneState || { activeScene: null },
      lobby: (lobbyData && {
        ...lobbyData.state,
        playersConnected: lobbyData.state.playersConnected.filter(pc => validConnections.some(gc => gc.id === pc.gameConnectionId))
      }) || { messages: [], playersConnected: [] },
    }

    const sceneMap = new Map(allScenes.map(s => [s.id, s]));
    const expositionMap = new Map(allExposisions.map(e => [e.id, e]))
    const locationMap = new Map(allLocations.map(l => [l.id, l]))
    const playlistMap = new Map(allPlaylists.map(p => [p.id, p]))
    const trackMap = new Map(allTracks.map(t => [t.id, t]))

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
      ...(await Promise.all(locations
        .map(l => l.background.type === 'image' ? l.background.imageAssetId : null)
        .filter(Boolean)
        .map(imageAssetId => asset.peek(imageAssetId))
      )),
      ...await asset.batchPeek([
        ...tracks.map(t => t.trackAudioAssetId)
      ]),
    ].filter(Boolean);

    const roomPage = {
      room,
      state,
      
      scene,
      locations,
      expositions,

      playlist,
      tracks,

      assets,
    };
    return roomPage;
  };

  const connect = (gameId, roomId, userId, gameConnectionId) => {
    const defaultLobby = {
      version: uuid(),
      roomId,
      state: {
        messages: [],
        playersConnected: [],
      }
    }
    console.log(defaultLobby);
    data.roomData.lobby.transaction(gameId, roomId, async (prev) => {
      const validConnections = await game.connection.getValidConnections(gameId, Date.now());
      return {
        version: uuid(),
        roomId,
        state: {
          ...prev.state,
          playersConnected: [
            ...prev.state.playersConnected.filter(pc => validConnections.some(gc => gc.id === pc.gameConnectionId)),
            { gameConnectionId, userId }
          ],
        }
      };
    }, 3, defaultLobby)
      .then(({ next, prev }) => {
        return data.roomData.lobbyUpdates.publish(gameId, next);
      }).catch(e => console.warn('DIDNT CONNECT', e))

    return () => {
      data.roomData.lobby.transaction(gameId, roomId, async (prev) => {
        return {
          version: uuid(),
          roomId,
          state: { 
            ...prev.state,
            playersConnected: prev.state.playersConnected
              .filter(p => p.gameConnectionId !== gameConnectionId),
          },
        };
      }).then(({ next, prev }) => {
          return data.roomData.lobbyUpdates.publish(gameId, next);
        }).catch(console.warn)
    }
  };

  return {
    getRoomPage,
    connect,
  }
}