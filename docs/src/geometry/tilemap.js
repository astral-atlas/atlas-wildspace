// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/

import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";
import { useAnimatedNumber, calculateCubicBezierAnimationPoint } from '@lukekaalim/act-curve';
import throttle from "lodash.throttle";

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  MeshBasicMaterial,
  DataTexture,
  RedFormat,
  RedIntegerFormat,
  IntType,
  UnsignedByteType,
  GLSL3,
  NearestFilter,
  UVMapping,
  RepeatWrapping,
  TextureLoader,
} from "three";
import { GeometryDemo } from "../demo";

import tilemapTestURL from './tilemap_test.png';
import { useTimeSpan } from "@lukekaalim/act-curve/schedule";

const writeVector3 = (array, index, x, y, z) => {
  array[(index * 3) + 0] = x;
  array[(index * 3) + 1] = y;
  array[(index * 3) + 2] = z;
}
const writeVector2 = (array, index, u, v) => {
  array[(index * 2) + 0] = u;
  array[(index * 2) + 1] = v;
}

export const calculateTilemapVertextCount = (width/*: number*/, height/*: number*/)/*: number*/ => (
  width * height * 4
);
export const calculateTilemapTriangleCount = (width/*: number*/, height/*: number*/)/*: number*/ => (
  width * height * 2
);

export const writeTilemapPositions = (
  array/*: $TypedArray | number[]*/,
  width/*: number*/,
  height/*: number*/,
) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vertexIndex = (x + (y * width)) * 4;
      const vi = vertexIndex;

      // top left
      writeVector3(array, vi + 0, x + 0, 0, y + 0)
      // top right
      writeVector3(array, vi + 1, x + 1, 0, y + 0)
      // bottom left
      writeVector3(array, vi + 2, x + 0, 0, y + 1)
      // bottom right
      writeVector3(array, vi + 3, x + 1, 0, y + 1)
    }
  }
}

export const writeTilemapIndcies = (
  array/*: $TypedArray | number[]*/,
  width/*: number*/,
  height/*: number*/,
) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vertexIndex = (x + (y * width)) * 4;
      const triangleIndex = (x + (y * width)) * 2;

      const vi = vertexIndex;
      const ti = triangleIndex;

      writeVector3(array, ti + 0, vi + 2, vi + 1, vi + 0);
      writeVector3(array, ti + 1, vi + 3, vi + 1, vi + 2);
    }
  }
}

export const writeTilemapUV = (
  array/*: $TypedArray | number[]*/,
  width/*: number*/,
  height/*: number*/,
) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vertexIndex = (x + (y * width)) * 4;
      const vi = vertexIndex;

      writeVector2(array, vi + 0, 0, 0);
      writeVector2(array, vi + 1, 1, 0);
      writeVector2(array, vi + 2, 0, 1);
      writeVector2(array, vi + 3, 1, 1);
    }
  }
}

/*::
export type TilemapProps = {
  height: number,
  width: number,
}
*/


const vertexShader = `
uniform sampler2D map;
varying vec2 vUv;

void main() {
  vec2 mapSize = vec2(textureSize(map, 0));

  float tileId = float(gl_VertexID / 4);

  float x = mod(tileId, mapSize.x) + 0.5;
  float y = floor(tileId / mapSize.x) + 0.5;

  vec2 mapPosition = vec2(
    x / mapSize.x,
    y / mapSize.y
  );
  
  vec4 tileOffset = texture(map, mapPosition);
  float mapIndex = (tileOffset.r * 255.0);

  float u = ((uv.x) / 4.0) + (mod(mapIndex, 4.0) / 4.0);
  float v = ((uv.y) / 4.0) + (floor(mapIndex / 4.0) / 4.0);

  vUv = vec2(u, v);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D tiles;
varying vec2 vUv;

void main() {
  gl_FragColor = texture(tiles, vUv);
}
`;

const data = new Uint8Array(10 * 10);
const mapTexture = new DataTexture(
  data, 10, 10, RedFormat, UnsignedByteType,
  UVMapping, RepeatWrapping, RepeatWrapping,
  NearestFilter
);
const tilesTexture = new TextureLoader().load(tilemapTestURL);

const material = new ShaderMaterial({
  fragmentShader,
  vertexShader,
  uniforms: {
    tiles: { value: tilesTexture },
    map: { value: mapTexture },
    division: { value: 0 },
    branchy: { value: false }
  }
});

export const Tilemap/*: Component<TilemapProps>*/ = ({ children, height, width }) => {
  const geometry = useDisposable(() => new BufferGeometry());

  useEffect(() => {
    const positions = new Float32Array(calculateTilemapVertextCount(width, height) * 3);
    const triangles = new Uint32Array(calculateTilemapTriangleCount(width, height) * 3);
    const uvs = new Float32Array(calculateTilemapVertextCount(width, height) * 2);

    writeTilemapPositions(positions, width, height);
    writeTilemapIndcies(triangles, width, height);
    writeTilemapUV(uvs, width, height);

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    geometry.setIndex(new BufferAttribute(triangles, 1))

    geometry.translate(Math.floor(-width/2), 0, Math.floor(-height/2));

  }, [height, width, geometry])

  return h(mesh, { geometry, material }, children)
};


export const TilemapDemo/*: Component<>*/ = () => {
  const [x, setX] = useState(1);
  const [y, setY] = useState(10);
  const [z, setZ] = useState(0);
  const [w, setW] = useState(false);

  const [zAnim] = useAnimatedNumber(z, z);
  
  useTimeSpan(zAnim.span, now => {
    const point = calculateCubicBezierAnimationPoint(zAnim, now);
    material.uniforms.division.value = point.position;
  }, [zAnim])

  useEffect(() => {
    material.uniforms.branchy.value = w;
  }, [w])

  useEffect(() => {
    const data = new Uint8Array(x * y);
    for (let v = 0; v < y; v++) {
      for (let u = 0; u < x; u++) {
        data[u + (v * x)] = (u + (v * x)) % 16;
      }
    }
    console.log(data);
    
    const mapTexture = new DataTexture(data, x, y, RedFormat, UnsignedByteType);

    material.uniforms.map.value = mapTexture;
    material.uniformsNeedUpdate = true;
    

    return () => {
      mapTexture.dispose();
    };
  }, [x, y]);


  return [
    h('input', { type: 'range', min: 0, max: 10, step: 1, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 10, step: 1, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 1, max: 100, step: 1, value: z, onInput: throttle(e => setZ(e.target.valueAsNumber), 100) }),
    h('input', { type: 'checkbox', min: 1, checked: w, onChange: e => setW(e.target.checked) }),
    
    h(GeometryDemo, {}, [
      h(Tilemap, { height: y, width: x })
    ])
  ];
};
