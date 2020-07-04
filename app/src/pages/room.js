import { h } from 'preact';
import { useState } from 'preact/hooks';

import { Grid } from '../components/svg/grid';

const RoomPage = () => {
  const scale = 100;

  const sprites = [
    { src: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png', x: 1, y: 1 },
  ];

  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [cameraDragStartPosition, setCameraDragStartPosition] = useState(null);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartPosition({ x: event.clientX, y: event.clientY });
    setCameraDragStartPosition({ x: cameraPosition.x, y: cameraPosition.y });
  };
  const onPointerMove = (event) => {
    if (dragStartPosition && cameraDragStartPosition) {
      const xDiff = event.clientX - dragStartPosition.x;
      const yDiff = event.clientY - dragStartPosition.y;
      setCameraPosition({ x: cameraDragStartPosition.x + xDiff, y: cameraDragStartPosition.y + yDiff });
    }
  };
  const onPointerUp = (event) => {
    setDragStartPosition(null);
    setCameraDragStartPosition(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const transformToScreenPosition = (gridPosition) => {
    return {
      x: (gridPosition.x * scale) + cameraPosition.x,
      y: (gridPosition.y * scale) + cameraPosition.y,
    }
  };

  const gridScreenPosition = transformToScreenPosition({ x: 0, y: 0 });

  return h('main', { class: 'room' }, [
    h('svg', { class: 'grid', onPointerDown, onPointerMove, onPointerUp, xmlns: 'http://www.w3.org/2000/svg' }, [
      h(Grid, { scale, x: gridScreenPosition.x, y: gridScreenPosition.y }),
      ...sprites.map(sprite => {
        const { x, y } = transformToScreenPosition(sprite);
        return h('image', { href: sprite.src, x, y, height: scale, width: scale });
      })
    ]),
  ]);
};

export {
  RoomPage,
};
