// @flow strict
/*:: import type { Node } from 'preact'; */
import { useState } from 'preact/hooks';
import { h } from 'preact';
import { Vector3 } from 'three';
import { ThreeCanvas } from '../components/three';
import { Cube, n } from '../lib/three';

const ThreeGraphApp = ({ showCubes, height }) => {
  if (!showCubes)
    return [];
  
  return [n(Cube, { position: new Vector3(0, height, 0) }, [
    n(Cube, { position: new Vector3(2, 0, 0) }),
    n(Cube, { position: new Vector3(-2, 0, 0) }),
    n(Cube, { position: new Vector3(0, 2, 0) }),
    n(Cube, { position: new Vector3(0, -2, 0) }),
  ])]
};

const CanvasPage = ()/*: Node*/ => {
  const [showCubes, setShowCubes] = useState(true);
  const [height, setHeight] = useState(0);

  return [
    h('button', { onClick: () => setShowCubes(!showCubes)}, 'Show/Hide' ),
    h('input', { type: 'number', step: 0.01, value: height, onInput: e => setHeight(parseFloat(e.currentTarget.value))}),
    h(ThreeCanvas, { rootNode: n(ThreeGraphApp, { showCubes, height }) }),
  ];
};

export {
  CanvasPage,
};