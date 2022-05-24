// @flow strict
/*:: import type { Component } from "@lukekaalim/act";*/
/*:: import type { MeshProps } from "@lukekaalim/act-three";*/
/*:: import type { Material } from "three";*/

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";
import { useAnimatedNumber, calculateCubicBezierAnimationPoint, useTimeSpan } from '@lukekaalim/act-curve';
import throttle from "lodash.throttle";

import {
  TextureLoader,
  Vector3,
  Color,
  PlaneGeometry,
  Vector2,
  RepeatWrapping,
  NearestFilter,
} from "three";
import { GeometryDemo } from "../demo";

import tilemapURL from '@astral-atlas/wildspace-components/encounter/tilemap_test.png';
import tilemapTestURL from './tilemap_test.png';
import {
  useRaycast,
  useRaycast2,
  useRaycastManager,
} from "../controls/raycast";
import { Tilemap, TilemapTile2DTexture } from "@astral-atlas/wildspace-components/encounter/Tilemap";
import { uvToTilemapPosition, localToTilemapPosition } from "@astral-atlas/wildspace-components";


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
  const [x, setX] = useState(2);
  const [y, setY] = useState(2);

  const raycast = useRaycastManager()

  const [painting, setPainting] = useState(false);
  const onMouseDown = (e) => {
    e.target.setPointerCapture(e.id);
    setPainting(true);
  }
  const onMouseUp = (e) => {
    e.target.releasePointerCapture(e.id);
    setPainting(false);
  }
  const onContextMenu = (e) => {
    e.preventDefault();
  }

  const mapTexture = useDisposable(() => {
    const data = new Uint8Array(
      Array.from({ length: y })
        .map((_, yi) => Array.from({ length: x })
          .map((_, xi) => [xi, yi, 1, 1])
          .flat(1)
        ).flat(1)
    );
    return new TilemapTile2DTexture(data, new Vector2(x, y));
  }, [x, y])
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const modi = ++i % 2;

      mapTexture.image.data[0] = modi * mapTexture.image.height *  mapTexture.image.width;
      mapTexture.image.data[1] = modi * mapTexture.image.height *  mapTexture.image.width;
      mapTexture.image.data[2] = modi * mapTexture.image.height *  mapTexture.image.width;

      mapTexture.needsUpdate = true;
   }, 1000);
   return () => clearInterval(id);
  }, [mapTexture])
  const ref = useRef();
  const click = (i) => {
    console.log({
      uv: uvToTilemapPosition(i.uv, mapTexture),
      local: localToTilemapPosition(i.object.worldToLocal(i.point), mapTexture)
    });
  }
  useRaycast2(raycast, ref, { click }, [mapTexture]);

  return [
    h('input', { type: 'range', min: 0, max: 32, step: 1, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 32, step: 1, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),

    h('input', { type: 'checkbox', disabled: true, checked: painting }),
    
    h(GeometryDemo, {
      raycastManager: raycast,
      showGrid: false,
      sceneProps: { background: new Color('#282c34'), },
      canvasProps: { onMouseDown, onMouseUp, onContextMenu } }, [
      h(Tilemap, {
        mapTexture,
        tilesTexture,
        tileSize,
        ref,
        position: new Vector3(0, 0, 0),
      }),
    ])
  ];
};

const tilesTexture = new TextureLoader()
  .load(tilemapTestURL);
tilesTexture.wrapS = RepeatWrapping;
tilesTexture.wrapT = RepeatWrapping;
tilesTexture.minFilter = NearestFilter;
tilesTexture.magFilter = NearestFilter;
//tilesTexture.generateMipmaps = false;
const tileSize = new Vector2(4, 4);