// @flow strict

import { createFloorForTerrain } from "@astral-atlas/wildspace-models";
import { h, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group, lineSegments, mesh, points, useDisposable } from "@lukekaalim/act-three";
import { renderCanvasContext } from "../../three/RenderCanvas";
import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  MeshBasicMaterial,
  Vector3,
  EdgesGeometry,
  Box3Helper,
  PointsMaterial,
} from "three";
import { TransformControls } from 'three/addons/controls/TransformControls.js';

/*::
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";

export type MiniTheaterFloorMeshProps = {
  miniTheater: MiniTheater,
}
*/

const material = new MeshBasicMaterial();
const pointsMaterial = new PointsMaterial({ vertexColors: true, transparent: true });

export const MiniTheaterFloorMesh/*: Component<MiniTheaterFloorMeshProps>*/ = ({
  miniTheater,
}) => {
  const [position, setPosition] = useState(new Vector3(0, 0, 0));
  const floors = useMemo(() => {
    return [
      {
        type: 'box',
        box: new Box3(new Vector3(0, 0, 0), new Vector3(10, 10, 10))
          .translate(position),
        matrix: new Matrix4().identity()
      },
    ]
  }, [miniTheater.pieces, miniTheater.terrain, position]);

  const aabb = floors.reduce((acc, curr) => {
    if (!acc)
      return curr.box.clone().applyMatrix4(curr.matrix);
    return acc.union(curr.box.clone().applyMatrix4(curr.matrix));
  }, null) || new Box3(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

  const geometry = useDisposable(() => {

    const geometry = new BufferGeometry();
    const positionArray = new Uint8Array(0);
    const position = new BufferAttribute(positionArray, 3)
    geometry.setAttribute('position', position)
    return geometry;
  }, [floors])

  const pointsGeometry = useDisposable(() => {

    const geometry = new BufferGeometry();
    const positionArray = new Int16Array(10 * 10 * 10 * 3);
    const colorArray = new Uint8Array(10 * 10 * 10 * 4);
    for (let i = 0; i < (10 * 10 * 10); i ++) {
      const x = Math.floor(i / 100) % 10;
      const y = Math.floor(i / 10) % 10;
      const z = Math.floor(i / 1) % 10;
      const position = new Vector3(x, y, z)
        .multiplyScalar(10)
        .addScalar(-45);
      positionArray[(i * 3) + 0] = position.x;
      positionArray[(i * 3) + 1] = position.y;
      positionArray[(i * 3) + 2] = position.z;

      const intensity = aabb.containsPoint(position) ? 1 : 0;
      colorArray[(i * 4) + 0] = 1;
      colorArray[(i * 4) + 1] = 1;
      colorArray[(i * 4) + 2] = 1;
      colorArray[(i * 4) + 3] = intensity;
    }
    
    const position = new BufferAttribute(positionArray, 3)
    const colorAttribute = new BufferAttribute(colorArray, 4);
    geometry.setAttribute('position', position)
    geometry.setAttribute('color', colorAttribute)
    geometry.computeBoundingBox();
    console.log(geometry.boundingBox);
    return geometry;
  }, [floors])

  const aabbGeo = useDisposable(() => {
    const size = aabb.getSize(new Vector3());
    const center = aabb.getCenter(new Vector3());
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    geometry.translate(center.x, center.y, center.z);
    const edges = new EdgesGeometry( geometry );
    return edges;
  }, [floors])
  const ref = useRef();
  const render = useContext(renderCanvasContext);
  useEffect(() => {
    const { current: parent } = ref;
    if (!parent || !render)
      return;
    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    if (!camera || !canvas)
      return;

    const boxHelper = new Box3Helper(aabb);
    const controls = new TransformControls(camera, canvas);
    parent.add(boxHelper);
    controls.attach(parent);
    parent.parent.add(controls);
    const onControlsUpdate = (e) => {
      if (e.value)
        return;
      setPosition(position.clone().copy(parent.position))
    };
    controls.addEventListener( 'dragging-changed', onControlsUpdate );
    return () => {
      controls.removeEventListener( 'dragging-changed', onControlsUpdate );
      if (boxHelper.parent)
        boxHelper.removeFromParent();
      if (controls.parent)
        controls.removeFromParent();
    }
  }, [])

  return [
    h(mesh, { geometry, material }),
    h(points, { geometry: pointsGeometry, material: pointsMaterial }),
    h(lineSegments, { geometry: aabbGeo }),
    h(group, { ref, position })
  ];
}