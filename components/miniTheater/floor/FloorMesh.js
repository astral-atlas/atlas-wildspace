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
} from "three";
import { useChildObject } from "../../three";
import {
  raycastManagerContext,
  useRaycast2,
} from "../../raycast/manager";
import { miniVectorToThreeVector, miniQuaternionToThreeQuaternion } from "../../utils";

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Mesh } from "three";
import type { MiniTheaterShape } from "@astral-atlas/wildspace-models";
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
const calculateCellCount = (floorAABB) => {
  const size = floorAABB.getSize(new Vector3())
    .multiplyScalar(0.1)
    .addScalar(1);
  return (size.x * size.y * size.z);
}

const mapPotentialCells = /*:: <T>*/(
  floorAABB,
  mapCellFunc/*: (i: number, x: number, y: number, z: number) => T*/
)/*: T[]*/ => {
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

const calcuateFloorCells = (floors, floorAABB) => {
  const cells = [];
  const box = new Box3(
    new Vector3(-0.5, -0.5, -0.5),
    new Vector3(0.5, 0.5, 0.5)
  )
  const floorMatrixMap = new Map(floors.map(f => [f, new Matrix4()
    .compose(
      miniVectorToThreeVector(f.position),
      miniQuaternionToThreeQuaternion(f.rotation),
      miniVectorToThreeVector(f.size)
    )
    .invert()]));

  const floorBoundsMap = calculateFloorAABBMap(floors);
  const chunks = createChunks(floorAABB, new Vector3(50, 50, 50));

  chunks.map(chunkAABB => {
    const floorsInChunk = floors.filter(f => {
      const floorBounds = floorBoundsMap.get(f);
      if (!floorBounds)
        return false;
      return chunkAABB.intersectsBox(floorBounds);
    })
    if (floorsInChunk.length < 1)
      return;

    mapPotentialCells(chunkAABB, (i, x, y, z) => {
      const point = new Vector3(x, y, z);

      const intersectsFloor = floorsInChunk.some(f => {
        const matrix = floorMatrixMap.get(f);
        if (!matrix)
          return false;

        return box.containsPoint(point.clone().applyMatrix4(matrix))
      })
  
      if (intersectsFloor) {
        cells.push(point)
      }
    });
  });
  

  return cells;
};

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
    console.info(`Floor Mesh Gen Ms`, endTime - startTime)
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
  floors: $ReadOnlyArray<MiniTheaterShape>,
  showDebug?: boolean,
  ref?: ?Ref<?Mesh>,
};
*/

const material = new MeshBasicMaterial({ transparent: true, opacity: 0.5, color: new Color('green') })

export const FloorMesh/*: Component<FloorMeshProps>*/ = ({
  floors,
  showDebug = false,
  ref: externalRef = null
}) => {
  const pointGeometry = useDisposable(() => new BufferGeometry());
  const floorGeometry = useDisposable(() => new BufferGeometry());
  const ref = useRef()

  const { floorAABB, cells, chunkFloors, chunks, subChunks, candidates } = useFloorCells(floors);

  useChildObject(ref, () => {
    return new Box3Helper(floorAABB);
  }, [floorAABB])

  useEffect(() => {
    if (!showDebug)
      return;
    const startTime = performance.now();
    
    const positionArray = new Float32Array(candidates.map(c => [c.x, c.y, c.z]).flat(1));
    pointGeometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    const endTime = performance.now();
    console.info(`Floor Points Write Ms`, endTime - startTime)
  }, [pointGeometry, chunks, chunkFloors, showDebug])

  useEffect(() => {
    const startTime = performance.now();
    const positionArray = new Float32Array(cells.length * 3 * 6);

    for (let i = 0; i < cells.length; i++) {
      const point = cells[i];
      const v = i * 3 * 6;
      write3dQuadVertices(positionArray, v, point.clone().add(new Vector3(0, -4, 0)));
    }

    floorGeometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    const endTime = performance.now();
    console.info(`Floor Geometry Write Ms`, endTime - startTime)
  }, [floorGeometry, cells])

  const localRef = useRef();
  const meshRef = externalRef || localRef;

  return h(group, { ref }, [
    h(points, { geometry: pointGeometry, visible: showDebug }),
    h(mesh, { geometry: floorGeometry, ref: meshRef, material, visible: showDebug }),
    showDebug && subChunks.map(({ subChunk }) => h(ChunkDebug, { ref, chunk: subChunk })),
    showDebug && chunks.map((chunk) => h(ChunkDebug, { ref, chunk, color: new Color('white') })),
    showDebug && floors.map(floor => h(FloorDebug, { floor })),
  ]);
}

const FloorMeshChunk = ({ chunk, chunkFloors }) => {

};

const ChunkDebug = ({ ref, chunk, color = new Color('yellow') }) => {
  const helper = useChildObject(ref, () => {
    return new Box3Helper(chunk, color)
  }, [chunk, color]);

  return null;
}

const FloorDebug = ({ floor }) => {
  const ref = useRef();

  const linesGeometry = useDisposable(() => {
    const box = new BoxGeometry(1, 1, 1);
    const lines = new EdgesGeometry(box);
    return lines;
  }, [floor])

  return h(lineSegments, {
    ref,
    position: miniVectorToThreeVector(floor.position),
    quaternion: miniQuaternionToThreeQuaternion(floor.rotation),
    scale: miniVectorToThreeVector(floor.size),
    geometry: linesGeometry,
  });
} 