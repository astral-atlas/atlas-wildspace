// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { PlaylistPlayer, Room, useAsync, useFullscreen, useGameConnection, useGameData, useGameUpdateTimes, useMiniTheaterController, useResourcesLoader, useRoomState } from "@astral-atlas/wildspace-components";
import { useURLParam } from "../../hooks/navigation";
import { useAPI, useGame, useRoom } from "../../hooks/api";
import { h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";
import { GameOverlay } from "@astral-atlas/wildspace-components";
import { configContext } from "../../hooks/config";

export const RoomPage/*: Component<>*/ = () => {  
  const [gameId, setGameId] = useURLParam('gameId');
  const [roomId, setRoomId] = useURLParam('roomId');
  const [identity] = useStoredValue(identityStore)
  const config = useContext(configContext)

  if (!gameId || !roomId || !identity || !config)
    return 'error!';

  const client = useAPI();

  const [game] = useAsync(async () => client.game.read(gameId), [gameId])
  const [user] = useAsync(async () => client.self(), [])

  if (!game)
    return 'Loading (Game)'
  
  const times = useGameUpdateTimes(client.game, gameId);
  const gameData = useGameData(game, identity.proof.userId, times, client);
  const roomState = useRoomState(gameId, roomId, client);

  if (!gameData)
    return 'Loading (Resources)'

  if (!roomState)
    return 'Loading (Room)'

  const [volume, setVolume] = useState(0);
  const ref = useRef();
  const [fullscreenElement, setFullscreen] = useFullscreen()
  const [update, setUpdates] = useState(null)
  useEffect(() => {
    const promise = client.game.updates.create(gameId);
    promise
      .then(setUpdates)
    return () => {
      promise.then(u => u.updates.close())
    }
  }, [client]);

  const [roomPage, setRoomPage] = useState(null)
  useEffect(() => {
    if (!update)
      return;
    return update.roomPage.subscribe(roomId, setRoomPage);
  }, [update])

  console.log(roomPage);

  return [
    h('div', { style: { height: '100%', width: '100%', position: 'relative' }, ref }, [
      h(Room, { client, gameData, roomState, gameId, userId: identity.proof.userId, roomId }),
      roomState.audio.playback.type === 'playlist' &&
        h(PlaylistPlayer, {
          volume,
          assets: gameData.assets,
          playlists: gameData.playlists,
          tracks: gameData.tracks,
          state: roomState.audio.playback.playlist
        }),
      h(GameOverlay, {
        sesameURL: new URL(config.www.sesame.httpOrigin),
        name: user && user.name,
        volume,
        onFullscreenClick: () => ref.current && setFullscreen(fullscreenElement === ref.current ? null : ref.current),
        onVolumeInput: nextVolume => setVolume(nextVolume),
      }),
    ])
  ];
};
