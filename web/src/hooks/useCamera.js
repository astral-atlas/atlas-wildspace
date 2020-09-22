// @flow
import { useState } from 'preact/hooks';
import { Vector2D } from '../lib/vector';

class Camera2D {
  position = new Vector2D(0,0);
  zoom = 1;

  constructor(position, zoom) {
    this.position = position;
    this.zoom = zoom;
  }

  movePosition(amountToMove/*: Vector2D*/) {
    return new Camera2D(this.position.add(amountToMove), this.zoom);
  }

  moveZoom(amountToZoom/*: number*/, zoomCenter/*: Vector2D*/) {
    return new Camera2D(this.position, this.zoom + amountToZoom);
  }
}

const useCamera = () => {
  const [cameraPosition, setCameraPosition] = useState(new Vector2D(0,0));
  const [cameraZoom, setCameraZoom] = useState(0);

  return {
    cameraPosition,
    setCameraPosition,
    cameraZoom,
    setCameraZoom,
  };
};

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
  useCamera,
  useDragSurface,
  useScreenPosition
}