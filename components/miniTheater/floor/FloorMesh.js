// @flow strict

import { h, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group, lineSegments, mesh, points, useDisposable } from "@lukekaalim/act-three";
import {
  Box3,
  Matrix4,
  Vector3,
  Box3Helper,
  BufferGeometry,
  BufferAttribute,
  BoxGeometry,
  EdgesGeometry,
  MeshBasicMaterial,
  Color,
  TextureLoader,
  AdditiveBlending,
  sRGBEncoding,
} from "three";
import { useChildObject } from "../../three";
import floorTestURL from './floor_test.png';
import floorOutlineTextureURL from './floor_outline_4x4.png';

import {
  raycastManagerContext,
  useRaycast2,
} from "../../raycast/manager";
import { miniVectorToThreeVector, miniQuaternionToThreeQuaternion } from "../../utils";
import { FloorOutline } from "./FloorOutline";

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Group, Mesh } from "three";
import type { MiniTheaterShape } from "@astral-atlas/wildspace-models";
import type { ReadOnlyRef } from "../../three/useChildObject";
import type { RefMap2 } from "../../editor/list";
*/

const calculateFloorAABBMap = (floors/*: $ReadOnlyArray<MiniTheaterShape>*/)/*: Map<MiniTheaterShape, Box3>*/ => {
  const floorEntries = floors.map((floorShape) => {
    const matrix = new Matrix4()
      .compose(
        miniVectorToThreeVector(floorShape.position),
        miniQuaternionToThreeQuaternion(floorShape.rotation),
        miniVectorToThreeVector(floorShape.size),
      );

    const box = new Box3(
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(0.5, 0.5, 0.5)
    )
      .applyMatrix4(matrix);
    return [floorShape, box];
  });
  return new Map(floorEntries);
}
const calculateFloorAABB = (floors/*: $ReadOnlyArray<MiniTheaterShape>*/)/*: Box3*/ => {
  const floorAABB = floors.reduce((acc, curr) => {
    const matrix = new Matrix4()
      .compose(
        miniVectorToThreeVector(curr.position),
        miniQuaternionToThreeQuaternion(curr.rotation),
        miniVectorToThreeVector(curr.size),
      );

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
const mapPotentialCells = /*:: <T>*/(
  floorAABB,
  mapCellFunc/*: (i: number, x: number, y: number, z: number) => T*/
)/*: T[]*/ => {
  const size = floorAABB.getSize(new Vector3())
    .multiplyScalar(0.1)

  const offset = floorAABB.getCenter(new Vector3())
    .add(size.clone().multiplyScalar(-5));

  //size.addScalar(1);
    
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

const defaultChunkSize = new Vector3(25, 25, 25)
const createChunks = (boundsBox, chunkSize = defaultChunkSize) => {
  const size = boundsBox.getSize(new Vector3())

  const chunkAABBs = [];

  for (let x = 0; x < size.x; x += chunkSize.x) {
    for (let y = 0; y < size.y; y += chunkSize.y) {
      for (let z = 0; z < size.z; z += chunkSize.z) {
        const min = new Vector3(x, y, z);
        const max = min.clone().add(chunkSize)
        const box = new Box3(min, max);
        box.translate(boundsBox.min)
        chunkAABBs.push(box);
      }
    }
  }
  return chunkAABBs;
}

const useFloorCells = (floors) => {
  return useMemo(() => {
    const startTime = performance.now();
    const floorAABB = calculateFloorAABB(floors);
    const floorBoundsMap = calculateFloorAABBMap(floors);
    const floorMatrixMap = new Map(floors.map(f => [f, new Matrix4()
      .compose(
        miniVectorToThreeVector(f.position),
        miniQuaternionToThreeQuaternion(f.rotation),
        miniVectorToThreeVector(f.size)
      )
      .invert()]));
    const floorCellBounds = new Box3(
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(0.5, 0.5, 0.5)
    )

    const chunks = createChunks(floorAABB, new Vector3(100, 100, 100));

    const chunkFloors = chunks
      .map(chunk =>
        floors.filter(floor => {
          const bounds = floorBoundsMap.get(floor);
          return bounds && bounds.intersectsBox(chunk);
        })
      );

    const cells = []
    const candidates = [];

    const subChunks = chunks.map((chunk, index) => {
      const floors = chunkFloors[index];
      if (floors.length < 1)
        return [];
      return createChunks(chunk, new Vector3(50, 50, 50))
        .map(subChunk => {
          const subFloors = floors.filter(floor => {
            const bounds = floorBoundsMap.get(floor);
            return bounds && bounds.intersectsBox(subChunk);
          });
          if (subFloors.length < 1)
            return;
          
          const subCells = [];
          mapPotentialCells(subChunk, (_, x, y, z) => {
            const point = new Vector3(x, y, z);
            candidates.push(point);
      
            const intersectsFloor = subFloors.some(f => {
              const matrix = floorMatrixMap.get(f);
              if (!matrix)
                return false;
      
              return floorCellBounds.containsPoint(point.clone().applyMatrix4(matrix))
            })
        
            if (intersectsFloor) {
              cells.push(point)
              subCells.push(point);
            }
          });
          return { subChunk, subFloors, subCells };
        }).filter(Boolean)
    }).flat(1)

    const endTime = performance.now();
    
    return {
      floorAABB,
      floorBoundsMap,

      subChunks,
      chunks,
      chunkFloors,

      cells,
      candidates,
    }
  }, [floors]);
}


/*::
export type FloorMeshProps = {
  floors: $ReadOnlyArray<MiniTheaterShape>,
  showDebug?: boolean,
  refMap?: ?RefMap2<Box3, Mesh>,
};
*/

export const FloorMesh/*: Component<FloorMeshProps>*/ = ({
  floors,
  showDebug = false,
  refMap,
}) => {
  const ref = useRef();

  const { floorAABB, cells, chunkFloors, chunks, subChunks, candidates } = useFloorCells(floors);

  return h(group, { ref, renderOrder: -10 }, [
    subChunks.map(({ subChunk, subFloors, subCells }) =>
      h(FloorMeshChunk, {
        subChunks,
        key: boxToString(subChunk),
        subChunk, subFloors, subCells,
        showDebug,
        parentRef: ref,
        ref: refMap && refMap.create(subChunk),
      })),
  ]);
}
const boxToString = (box) => {
  return [
    box.min.x, box.min.y, box.min.z,
    box.max.x, box.max.y, box.max.z
  ].join(':');
}

const FloorMeshChunk = ({ subChunk, subFloors, showDebug, subCells, ref, parentRef, subChunks }) => {
  const size = subChunk.getSize(new Vector3())
  const center = subChunk.getCenter(new Vector3())
    .add(new Vector3(0, (-size.y/2) + 5, 0))
  const adjacentChunksBox = subChunk.clone().expandByVector(size);
  const adjacentChunks = subChunks.filter(sc => adjacentChunksBox.intersectsBox(sc.subChunk))
  const adjacentCells = useMemo(() => [
    ...subCells,
    ...adjacentChunks.map(ac => ac.subCells).flat(1),
  ], [subChunks]);
  const localRef = useRef();
  const meshRef = ref || localRef;

  return h(FloorOutline, {
    cells: subCells,
    adjacentCells,
    ref: meshRef,
    position: center
  });
};
