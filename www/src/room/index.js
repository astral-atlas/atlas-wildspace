// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { useConnection } from "@astral-atlas/wildspace-components";
import { useURLParam } from "../../hooks/navigation";
import { useAPI, useRoom } from "../../hooks/api";
import { h } from "@lukekaalim/act";


export const RoomPage/*: Component<>*/ = () => {
  const api = useAPI();
  const [gameId, setGameId] = useURLParam('gameId');
  const [roomId, setRoomId] = useURLParam('roomId');
  
  const { audio, encounter } = useRoom(gameId, roomId);

  return h('pre', {}, JSON.stringify(audio, null, 2))
};
