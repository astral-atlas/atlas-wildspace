import { useState } from 'preact/hooks';

const useDragSurface = (onDragUpdate) => {
  const [dragPosition, setDragPosition] = useState(null);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPosition({ x: event.clientX, y: event.clientY });
  };
  const onPointerMove = (event) => {
    if (!dragPosition)
      return;
  
    onDragUpdate({ x: event.clientX - dragPosition.x, y: event.clientY - dragPosition.y });
    setDragPosition({ x: event.clientX, y: event.clientY });
  };
  const onPointerUp = (event) => {
    setDragPosition(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const dragEventListeners = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };

  return dragEventListeners;
};

const useScreenPosition = (cameraPosition, objectPosition) => {
  return {
    x: (objectPosition.x) + cameraPosition.x,
    y: (objectPosition.y) + cameraPosition.y,
  }
};

export {
  useDragSurface,
  useScreenPosition
}