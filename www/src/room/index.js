// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { Room, useConnection, useGameData, useGameUpdateTimes } from "@astral-atlas/wildspace-components";
import { useURLParam } from "../../hooks/navigation";
import { useAPI, useGame, useRoom } from "../../hooks/api";
import { h } from "@lukekaalim/act";


export const RoomPage/*: Component<>*/ = () => {  
  const [gameId, setGameId] = useURLParam('gameId');
  const [roomId, setRoomId] = useURLParam('roomId');

  if (!gameId || !roomId)
    return 'error!';

  const client = useAPI();
  
  const times = useGameUpdateTimes(client.game, gameId);
  const data = useGameData(gameId, times, client);


  return h(Room, { client, data, gameId })
};
