// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
/*:: import type { MeshProps } from "@lukekaalim/act-three";*/
/*:: import type { Material } from "three";*/

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";
import { useAnimatedNumber, calculateCubicBezierAnimationPoint, useTimeSpan } from '@lukekaalim/act-curve';
import throttle from "lodash.throttle";

import {
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  DataTexture,
  RedFormat,
  UnsignedByteType,
  NearestFilter,
  UVMapping,
  RepeatWrapping,
  TextureLoader,
  Vector3,
  Color,
  PlaneGeometry,
} from "three";
import { GeometryDemo } from "../demo";

import tilemapTestURL from './tilemap_test.png';
import board_grid_tilemap from './board_grid_tilemap.png';
import { useRaycast, useRaycastManager } from "../controls/raycast";

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

      writeVector2(array, vi + 0, 0, 1);
      writeVector2(array, vi + 1, 1, 1);
      writeVector2(array, vi + 2, 0, 0);
      writeVector2(array, vi + 3, 1, 0);
    }
  }
}



const vertexShader = `
uniform sampler2D map;
uniform vec2 tilesSize;
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

  float u = ((uv.x) / tilesSize.x) + (mod(mapIndex, tilesSize.x) / tilesSize.x);
  float v = ((uv.y) / tilesSize.y) + ((tilesSize.y - floor(mapIndex / tilesSize.x) - 1.0) / tilesSize.y);

  vUv = vec2(u, v);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D tiles;
varying vec2 vUv;

void main() {
  gl_FragColor = texture(tiles, vUv);
	if ( gl_FragColor.a < 0.5 ) discard;
}
`;

const data = new Uint8Array(10 * 10);
const mapTexture = new DataTexture(
  data, 10, 10, RedFormat, UnsignedByteType,
  UVMapping, RepeatWrapping, RepeatWrapping,
  NearestFilter
);
const tilesTexture = new TextureLoader().load(board_grid_tilemap);

const material = new ShaderMaterial({
  fragmentShader,
  vertexShader,
  uniforms: {
    tiles: { value: tilesTexture },
    map: { value: mapTexture },
    tilesSize: { value: [8, 8] }
  }
});

/*::
export type TilemapProps = {
  ...$Diff<MeshProps, {| geometry?: BufferGeometry, material?: Material |}>,

  height: number,
  width: number,
}
*/

export const Tilemap/*: Component<TilemapProps>*/ = ({ children, height, width, ...meshProps }) => {
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

  return h(mesh, { ...meshProps, geometry, material }, children)
};

const ClickPlane = ({ width, height, over }) => {
  const ref = useRef();
  const geometry = useDisposable(() => {
    return new PlaneGeometry(width, height)
      .rotateX(Math.PI * -0.5)
      .translate( (width % 2) * -0.5, 0, (height % 2) * -0.5)
  }, [height, width]);

  useRaycast(ref, { over }, [over]);

  return h(mesh, { ref, geometry, visible: false });
};


export const TilemapDemo/*: Component<>*/ = () => {
  const [x, setX] = useState(64);
  const [y, setY] = useState(64);

  useEffect(() => {
    const encoder = new TextEncoder();
    const encodedData = localStorage.getItem('terrain')

    const data = encodedData && encoder.encode(encodedData) || new Uint8Array(x * y);

    const mapTexture = new DataTexture(data, x, y, RedFormat, UnsignedByteType);
    material.uniforms.map.value = mapTexture;
    
    return () => {
      mapTexture.dispose();
    };
  }, [x, y]);

  const over = (e) => {
    if (!painting)
      return;
  
    const local = e.object.worldToLocal(e.point)
    const grid = [Math.floor(local.x + (x/2) + ((x % 2) * 0.5)), Math.floor(local.z + (y/2) + ((y % 2) * 0.5))]
    
    const texture = ((material.uniforms.map.value/*: any*/)/*: DataTexture*/)
    const data = texture.image.data;

    const gridIndex = grid[0] + (grid[1] * x);
    const prevIndex = data[gridIndex];
    data[gridIndex] = brushId;
    const needsUpdate = prevIndex !== brushId;

    texture.needsUpdate = needsUpdate;
    if (needsUpdate) {
      const dataToSave = new Uint8Array(data);
      const decode = new TextDecoder('utf-8', { fatal: false });
      localStorage.setItem('terrain', decode.decode(dataToSave));
    }
  }

  const [brushId, setBrushId] = useState(0)

  const [painting, setPainting] = useState(false);
  const onMouseDown = (e) => {
    e.target.setPointerCapture(e.id);
    setPainting(true);
  }
  const onMouseUp = (e) => {
    e.target.releasePointerCapture(e.id);
    setPainting(false);
  }

  return [
    h('input', { type: 'range', min: 0, max: 32, step: 1, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 32, step: 1, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),

    h('select', { onChange: e => setBrushId(parseInt(e.target.value)) }, 
      Array.from({ length: (8 * 8) }).map((_, i) => h('option', { value: i, selected: brushId === i }, `Brush ${i}`)),
    ),
    
    h(GeometryDemo, { showGrid: false, sceneProps: { background: new Color('#282c34'), }, canvasProps: { onMouseDown, onMouseUp } }, [
      h(Tilemap, { height: y, width: x, position: new Vector3(0, 0.1, 0), geometry: new BufferGeometry() }),
      h(ClickPlane, { height: y, width: x, over }),
    ])
  ];
};
