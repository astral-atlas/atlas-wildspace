// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/
import throttle from 'lodash.throttle';
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, points, useDisposable } from "@lukekaalim/act-three";

import {
  BufferAttribute,
  BufferGeometry,
  Vector3,
  MeshBasicMaterial,
  TextureLoader,
} from "three";

import gradiantURL from './gradiant.jpg';
import { GeometryDemo } from "../demo";

const threshold = (input, limit) => {
  return input <= limit ? 0 : 1;
}

export const writeVertexPositions = (
  [width, height]/*: [number, number]*/,
  borderSize/*: number*/,
  output/*: number[] | $TypedArray*/,
) => {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x ++) {
      const i = (x + (y * 4)) * 3;
      const vertexX = ((((x + 1) % 3) - 1) * borderSize) + (threshold(x, 1) * width);
      const vertexY = ((((y + 1) % 3) - 1) * borderSize) + (threshold(y, 1) * height);

      output[i + 0] = vertexX;
      output[i + 1] = 0;
      output[i + 2] = vertexY;
    }
  }
}
export const writeTriangleIndices = (
  output/*: number[] | Uint8Array*/
) => {
  for (let square = 0; square < 9; square++) {
    const i = square * 6;
  
    const topLeft = (square % 3) + (Math.floor(square / 3) * 4);
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + 4;
    const bottomRight = bottomLeft + 1;

    output[i + 0] = bottomLeft;
    output[i + 1] = topRight;
    output[i + 2] = topLeft;

    output[i + 3] = bottomLeft;
    output[i + 4] = bottomRight;
    output[i + 5] = topRight;
  }
}
export const writeUV = (
  output/*: number[] | $TypedArray*/
) => {
  for (let i = 0; i < 16; i++) {
    const x = i % 4;
    const y = ((i - x) / 4);

    const v = i * 2;

    output[v + 0] = x / 3;
    output[v + 1] = y / 3;
  }
}

export const createNineSlicedGeometry = ()/*: BufferGeometry*/ => {
  const geometry = new BufferGeometry();
  const vertexCount = 16;
  const triangleCount = 18;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 3);
  const triangles = new Uint8Array(triangleCount * 3);

  writeTriangleIndices(triangles);
  writeUV(uvs);

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(triangles, 1));
  return geometry;
};


const texture = new TextureLoader().load(gradiantURL);
const material = new MeshBasicMaterial({ map: texture });

export const NineSliceDemo/*: Component<>*/ = () => {
  const [x, setX] = useState(5);
  const [y, setY] = useState(5);
  const [b, setB] = useState(1);

  const maxWidth = Math.min(x/2, y/2);
  
  const geometry = useDisposable(() => {
    return createNineSlicedGeometry();
  }, []);
  const [geometryVersion, setGeometryVersion] = useState(0);

  useEffect(() => {
    const position = geometry.getAttribute('position');
    writeVertexPositions([x, y], Math.min(b, maxWidth), position.array);
    position.needsUpdate = true;
    setGeometryVersion(position.version);
  }, [x, y, b, geometry]);

  const pointsGeometry = useDisposable(() => {
    const pointsGeometry = new BufferGeometry();
    pointsGeometry.setAttribute('position', geometry.getAttribute('position'));
    return pointsGeometry;
  }, [geometry]);

  return [
    h('input', { type: 'range', min: b*2, max: 10, step: 0.01, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: b*2, max: 10, step: 0.01, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: maxWidth, step: 0.01, value: Math.min(b, maxWidth), onInput: throttle(e => setB(e.target.valueAsNumber), 100) }),
    h(GeometryDemo, {}, [
      h(mesh, { geometry, material, position: new Vector3(-x / 2, 0, -y / 2) }),
      //h(group, { ref: groupRef }),
      h(points, { geometry: pointsGeometry, position: new Vector3(-x / 2, 0, -y / 2) }),
    ])
  ];
};
