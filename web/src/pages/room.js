import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useAppContext } from '../context/appContext';
import { usePageContext } from '../context/pageContext';
import { useRoom } from '../hooks/useWildspace';

import { Scene } from '../components/scene';

const RoomPage = () => {
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [, params] = usePageContext();
  const [appState] = useAppContext();

  const invitation = appState.playerInvitations.find(invitation => invitation.roomId === params.roomId);
  const [room, error] = useRoom(invitation.roomId, invitation.secret, 1000);

  if (error)
    return h('p', {}, error.stack);

  if (!room)
    return h('p', {}, 'Loading');

  const centerCameraOnPlayer = () => {
    setCameraPosition({
      x: room.player.x,
      y: room.player.y,
    })
  };

  return [
    h(Scene, { room, onCameraMove: setCameraPosition, cameraPosition }),
    h('section', { class: 'player-controls' }, [
      h('button', { onClick: centerCameraOnPlayer }, 'Center on Player'),
      h('pre', {}, JSON.stringify({ x: Math.floor(cameraPosition.x / 70), y: Math.floor(cameraPosition.y / 70) })),
    ])
  ];
};

export {
  RoomPage,
};
