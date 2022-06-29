// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
/*:: import type { MeshProps } from "@lukekaalim/act-three";*/
/*:: import type { Color, Material, Texture, Vector3 } from "three";*/

import { h, useEffect } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";

import fragmentShader from './tilemapFragmentShader.glsl?raw';
import vertexShader from './tilemapVertexShader.glsl?raw';

import {
  ShaderMaterial,
  DataTexture,
  UnsignedByteType,
  AdditiveBlending,
  NearestFilter,
  UVMapping,
  RGBAFormat,
  RepeatWrapping,
  Vector2,
  BufferGeometry,
  BufferAttribute,
} from "three";


export class TilemapTile2DTexture extends DataTexture {
  /*:: tileIds: Uint8Array*/
  /*:: mapSize: Vector2*/

  constructor(tileIds/*: Uint8Array*/, mapSize/*: Vector2*/) {
    super(
      tileIds, mapSize.x, mapSize.y,
      RGBAFormat, UnsignedByteType,
      UVMapping, RepeatWrapping, RepeatWrapping,
      NearestFilter
    )
    this.tileIds = tileIds;
    this.mapSize = mapSize;
    this.needsUpdate = true;
  }
}

export class TilemapMaterial extends ShaderMaterial {
  constructor(mapTexture/*: TilemapTile2DTexture*/, tilesTexture/*: Texture*/, tileSize/*: Vector2*/) {
    super({
      defines: { USE_COLOR_ALPHA: true, USE_COLOR: true },
      blending: AdditiveBlending,
      fragmentShader,
      vertexShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        tint: { value: [1, 1, 1, 1] },
        tiles: { value: tilesTexture },
        map: { value: mapTexture },
        mapSize: { value: mapTexture.mapSize },
        tilesSize: { value: tileSize }
      }
    });
  }
}


export const useTilemapMaterial = (
  mapTexture/*: TilemapTile2DTexture*/,
  tilesTexture/*: Texture*/,
  tileSize/*: Vector2*/,
  color/*: ?Color*/ = null,
  opacity/*: number*/ = 1,
)/*: TilemapMaterial*/ => {
  const material = useDisposable(() => new TilemapMaterial(mapTexture, tilesTexture, tileSize), []);
  
  useEffect(() => {
    material.uniforms.map.value = mapTexture;
    material.uniforms.tiles.value = tilesTexture;
    material.uniforms.tilesSize.value = tileSize;
    material.uniforms.tint.value = color ? [color.r, color.g, color.b, opacity] : [1, 1, 1, opacity];
  }, [mapTexture, tilesTexture, tileSize, color, opacity])

  return material;
};

/*::
export type TilemapProps = {
  ...$Diff<MeshProps, {| geometry?: BufferGeometry, material?: Material |}>,

  mapTexture: TilemapTile2DTexture,
  tilesTexture: Texture,
  tileSize: Vector2,
  scale?: number,
  color?: Color,
  opacity?: number,
}
*/

export const Tilemap/*: Component<TilemapProps>*/ = ({
  mapTexture,
  tilesTexture,
  tileSize,
  children,
  color,
  opacity,
  scale = 1,
  ...meshProps
}) => {
  const flatPlaneGeometry = useDisposable(() => {
    const { mapSize } = mapTexture;
    const x = mapSize.x * scale;
    const y = mapSize.y * scale;
    const buffer = new BufferGeometry();
    const positions = new Uint16Array([
      [0, 0, 0],
      [0, 0, y],
      [x, 0, y],
      [x, 0, 0],
    ].flat(1));
    const indices = new Uint8Array([
      [0, 1, 2],
      [0, 2, 3],
    ].flat(1));
    const uvs = new Uint8Array([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ].flat(1));
    buffer.setAttribute('position', new BufferAttribute(positions, 3));
    buffer.setAttribute('uv', new BufferAttribute(uvs, 2));
    buffer.setIndex(new BufferAttribute(indices, 1));
    return buffer;
  },
    [mapTexture, scale]
  );

  const material = useTilemapMaterial(mapTexture, tilesTexture, tileSize, color, opacity);

  return h(mesh, { ...meshProps, geometry: flatPlaneGeometry, material }, children)
};

export const uvToTilemapPosition = (uv/*: Vector2*/, size/*: Vector2*/)/*: Vector2*/ => {
  return new Vector2(
    Math.floor(uv.x * size.width),
    Math.floor(uv.y * size.height),
  );
}

export const localToTilemapPosition = (localVector/*: Vector3*/, scale/*: number*/ = 1)/*: Vector2*/ => {
  return new Vector2(
    Math.floor(localVector.x / scale),
    Math.floor(localVector.z / scale),
  )
}