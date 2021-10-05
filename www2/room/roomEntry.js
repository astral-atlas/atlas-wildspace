// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-web';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';

import { usePlaylistTrackData, RoomAudioPlayer } from "../components/RoomAudioPlayer.js";
import { useConnection } from "../hooks/connect.js";
import { clientContext } from "../hooks/context.js";

const RoomAudio = ({ gameId, audio }) => {
  const tracksData = usePlaylistTrackData(gameId, audio.playlistId);

  return [
    h(RoomAudioPlayer, { tracksData, audio })
  ];
};

const Room = ({ gameId, roomId }) => {
  const client = useContext(clientContext)

  const { audio = null } = useConnection(async (u) => (await client.room.state.connect(gameId, roomId, u)).close, { audio: null });

  return [
    audio && h(RoomAudio, { gameId, audio }),
  ];
};

const RoomPage = () => {
  const [ready, setReady] = useState(false);
  const gameId = '26272d50-5400-4e39-b7c2-1596141bee2c';
  const roomId = "ae7c3dc1-86cb-4a3d-9535-601b95887f66";


  return [
    h('h1', {},'Room'),
    h(AuthorizerFrame, { identityOrigin: 'http://sesame.astral-atlas.com' }),
    ready ? h(Room, { gameId, roomId }) : h('button', { onClick: () => setReady(true) }, 'Enter Room'),
  ]
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  render(h(RoomPage), body);
};

main();