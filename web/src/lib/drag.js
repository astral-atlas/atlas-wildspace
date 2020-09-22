// @flow strict
import { Vector2D } from '../lib/vector';

const getMousePositionFromEvent = (event) => {
  return new Vector2D(event.clientX, event.clientY)
};

const createDragHandlers = (onDragUpdate/*: (dragDiff: Vector2D) => void*/) => {
  let lastDragPosition = new Vector2D(0,0);

  const onDragStart = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const newDragPosition = getMousePositionFromEvent(event);
    lastDragPosition = newDragPosition;
  };
  const onDragContinue = (event) => {
    const newDragPosition = getMousePositionFromEvent(event);
    onDragUpdate(newDragPosition.add(dragPosition.negate()));
    lastDragPosition = newDragPosition;
  };
  const onDragEnd = (event) => {
    lastDragPosition = new Vector2D(0,0);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return {
    onDragStart,
    onDragContinue,
    onDragEnd,
  };
};

export { createDragHandlers };