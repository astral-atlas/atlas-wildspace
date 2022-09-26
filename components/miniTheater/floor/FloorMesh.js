// @flow strict

import { h, useContext, useEffect, useMemo, useRef } from "@lukekaalim/act";
import { group, mesh, points, useDisposable } from "@lukekaalim/act-three";
import {
  Box3,
  Matrix4,
  Vector3,
  Box3Helper,
  BufferGeometry,
  BufferAttribute,
} from "three";
import { useChildObject } from "../../three";
import {
  raycastManagerContext,
  useRaycast2,
} from "../../raycast/manager";

/*::
import type { FloorShape } from "./FloorShapeEditor";
import type { Component, Ref } from "@lukekaalim/act";
import type { Mesh } from "three";
*/

const calculateFloorAABB = (floors/*: $ReadOnlyArray<FloorShape>*/)/*: Box3*/ => {
  const floorAABB = floors.reduce((acc, curr) => {
    const matrix = new Matrix4()
      .compose(curr.position, curr.quaternion, curr.size);

    const floorBoundingBox = new Box3(
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(0.5, 0.5, 0.5)
    )
      .applyMatrix4(matrix);

    acc.union(floorBoundingBox);
    return acc;
  }, new Box3().makeEmpty());

  floorAABB.min.multiplyScalar(0.1).floor().multiplyScalar(10);
  floorAABB.max.multiplyScalar(0.1).ceil().multiplyScalar(10);

  return floorAABB;
}
const calculateCellCount = (floorAABB) => {
  const size = floorAABB.getSize(new Vector3())
    .multiplyScalar(0.1)
    .addScalar(1);
  return (size.x * size.y * size.z);
}
const mapPotentialCells = (floorAABB, mapCellFunc) => {
  const size = floorAABB.getSize(new Vector3())
    .multiplyScalar(0.1)

  const offset = floorAABB.getCenter(new Vector3())
    .add(size.clone().multiplyScalar(-5));

  size.addScalar(1);
    
  const potentialCells = (size.x * size.y * size.z);
  
  const result = [];
  
  for (let i = 0; i < potentialCells; i++) {
    const x = i % size.x;
    const y = Math.floor(i / size.x) % size.y;
    const z = Math.floor(i / size.y / size.x) % size.z;
    result[i] = mapCellFunc(i,
      (x * 10) + offset.x,
      (y * 10) + offset.y,
      (z * 10) + offset.z,
    );
  };
  return result;
}

const calcuateFloorCells = (floors, floorAABB) => {
  const cells = [];
  const box = new Box3(
    new Vector3(-0.5, -0.5, -0.5),
    new Vector3(0.5, 0.5, 0.5)
  )
  const floorMatricies = floors.map(f => new Matrix4()
    .compose(f.position, f.quaternion, f.size)
    .invert());
  
  mapPotentialCells(floorAABB, (i, x, y, z) => {
    const point = new Vector3(x, y, z);

    const intersectsFloor = floorMatricies.some(m =>
      box.containsPoint(point.clone().applyMatrix4(m)));
    
    if (intersectsFloor) {
      cells.push(point)
    }
  });

  return cells;
};

const write3dPositionVertex = (array, index, x, y, z) => {
  array[index + 0] = x;
  array[index + 1] = y;
  array[index + 2] = z;
}
const write3dQuadVertices = (array, index, point) => {
  // top right => bottom right => bottom left
  write3dPositionVertex(array, index + (0 * 3), point.x + 5, point.y, point.z + 5);
  write3dPositionVertex(array, index + (1 * 3), point.x + 5, point.y, point.z - 5);
  write3dPositionVertex(array, index + (2 * 3), point.x - 5, point.y, point.z - 5);

  // top right => bottom left => top left
  write3dPositionVertex(array, index + (3 * 3), point.x + 5, point.y, point.z + 5);
  write3dPositionVertex(array, index + (4 * 3), point.x - 5, point.y, point.z - 5);
  write3dPositionVertex(array, index + (5 * 3), point.x - 5, point.y, point.z + 5);
}

/*::
export type FloorMeshProps = {
  floors: $ReadOnlyArray<FloorShape>,
  ref?: ?Ref<?Mesh>,
};
*/

export const FloorMesh/*: Component<FloorMeshProps>*/ = ({
  floors,
  ref: externalRef = null
}) => {
  const floorAABB = useMemo(() =>
    calculateFloorAABB(floors), [floors]);

  const ref = useRef()

  useChildObject(ref, () => {
    return new Box3Helper(floorAABB);
  }, [floorAABB])

  const floorCells = useMemo(() => {
    return calcuateFloorCells(floors, floorAABB);
  }, [floors, floorAABB]);

  const pointGeometry = useDisposable(() => {
    const positionArray = new Float32Array(calculateCellCount(floorAABB) * 3);

    mapPotentialCells(floorAABB, (i, x, y, z) => {
      const v = i * 3;
      positionArray[v + 0] = x;
      positionArray[v + 1] = y;
      positionArray[v + 2] = z;
    });
    
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    return geometry;
  }, [floorCells])

  const floorGeometry = useDisposable(() => {
    const positionArray = new Float32Array(floorCells.length * 3 * 6);

    for (let i = 0; i < floorCells.length; i++) {
      const point = floorCells[i];
      const v = i * 3 * 6;
      write3dQuadVertices(positionArray, v, point);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    return geometry;
  }, [floorCells])

  const localRef = useRef();
  const meshRef = externalRef || localRef;

  return h(group, { ref }, [
    h(points, { geometry: pointGeometry }),
    h(mesh, { geometry: floorGeometry, ref: meshRef }),
  ]);
}