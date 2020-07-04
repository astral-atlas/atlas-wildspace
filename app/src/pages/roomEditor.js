import { h } from 'preact';
import { useState } from 'preact/hooks';
import { EditorPanel } from '../components/editor';
import { useDragSurface } from '../hooks/useCamera';
import { createVector2, addVector2, negateVector2 } from '../lib/vector';
import { Grid } from '../components/svg/grid';

const RoomEditor = ({ roomId, initialRefereeSecret }) => {
  const [room, setRoom] = useState({ backgrounds: [], roomId, refereeSecret: initialRefereeSecret })
  const [cameraPosition, setCameraPosition] = useState(createVector2());
  const [cursorPosition, setCursorPosition] = useState(createVector2());
  const dragListeners = useDragSurface(dragDiff => setCameraPosition(addVector2(cameraPosition, negateVector2(dragDiff))));

  const onPointerMove = (event) => {
    dragListeners.onPointerMove(event);
    setCursorPosition(addVector2(createVector2(event.clientX, event.clientY)))
  }

  const drawBox = (gridPosition, size = 1) => {
    return h('rect', {
      fill: '#0070ff2e',
      x: (gridPosition.x * 75) - cameraPosition.x,
      y: (gridPosition.y * 75) - cameraPosition.y,
      width: size * 75, height: size *  75
    })
  };

  return [
    h('svg', { ...dragListeners, onPointerMove, class: 'grid', xmlns: 'http://www.w3.org/2000/svg' }, [
      ...room.backgrounds.map(background => h('image', {
        href: background.src,
        x: (background.x * 75) - cameraPosition.x,
        y: (background.y * 75) - cameraPosition.y,
        width: background.width * 75, height: background.height *  75
      })),
      h(Grid, { x: -cameraPosition.x, y: -cameraPosition.y, scale: 75 }),
      drawBox({
        x: Math.floor((cameraPosition.x + cursorPosition.x) / 75),
        y: Math.floor((cameraPosition.y + cursorPosition.y) / 75),
      })
    ]),
    h(EditorPanel, { cameraPosition, cursorPosition, room, setRoom })
  ];
};

export {
  RoomEditor,
};
