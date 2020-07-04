import { h } from 'preact';
import { useState } from 'preact/hooks';
import { addVector2, createVector2 } from '../lib/vector';
import { useDragSurface } from '../hooks/useCamera';
import { Grid } from './svg/grid';

const Scene = () => {
  const [cameraPosition, setCameraPosition] = useState(createVector2());
  const dragListeners = useDragSurface(dragDiff => setCameraPosition(addVector2(cameraPosition, dragDiff)));

  return h('svg', { ...dragListeners, class: 'grid', xmlns: 'http://www.w3.org/2000/svg' }, [
    h(Grid, { x: cameraPosition.x, y: cameraPosition.y, scale: 75 })
  ]);
};

export {
  Scene
}