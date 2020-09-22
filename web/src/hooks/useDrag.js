import { useState } from 'preact/hooks';

import { Vector2D } from '../lib/vector';

const getMousePositionFromEvent = (event) => {
  return new Vector2D(event.clientX, event.clientY)
};

const useDrag = (onDragUpdate) => {
  const [dragPosition, setDragPosition] = useState(new Vector2D(0,0));

  const onDragStart = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const newDragPosition = getMousePositionFromEvent(event);
    setDragPosition(newDragPosition);
  };
  const onDragContinue = (event) => {
    const newDragPosition = getMousePositionFromEvent(event);
    onDragUpdate(newDragPosition.add(dragPosition.negate()));
    setDragPosition(newDragPosition);
  };
  const onDragEnd = (event) => {
    setDragPosition(new Vector2D(0,0));
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
};

export {
  useDrag,
};
