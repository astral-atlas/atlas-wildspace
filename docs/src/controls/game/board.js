// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { MiniID } from "@astral-atlas/wildspace-models"; */
/*:: import type { Vector2, Quaternion, Material } from "three"; */
/*:: import type { RaycastManager } from "../raycast"; */

import { h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { raycastManagerContext, useRaycast2 } from "../raycast";
import { BoxGeometry, BufferGeometry, PlaneGeometry, Vector3, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { mesh } from "@lukekaalim/act-three";
import { useAnimation } from "@lukekaalim/act-curve";



/*::
export type BoardVector = [number, number, number];

export type BoardPieceID = string;
export type BoardPiece = {
  area: BoardArea,
  pieceId: BoardPieceID,
};

export type Board = {
  height: number,
  width: number,

  pieces: BoardPiece[],
};

export type BoxBoardArea = {
  type: 'box',
  origin: BoardVector,
  width: number,
  height: number,
  depth: number,
};
export type CylinderBoardArea = {
  type: 'cylinder',
  origin: BoardVector,
  radius: number,
  height: number,
}

export type BoardArea =
  | BoxBoardArea
  | CylinderBoardArea
*/

const planeGeo = new PlaneGeometry(10, 10, 1, 1);
const cubeGeo = new BoxGeometry(10, 2, 10, 1, 1, 1).translate(0, 1, 0);

const defaultGeometry = new BufferGeometry();

const useGeometry = (geometryCreator, deps) => {
  const [geometry, setGeometry] = useState(defaultGeometry);
  useEffect(() => {
    const geo = geometryCreator();
    setGeometry(geo);

    return () => {
      geo.dispose();
    }
  }, deps)
  return geometry;
};

const PieceRenderer = ({ piece: { pieceId, area: { origin } }, focused }) => {
  return h(mesh, {
    geometry: cubeGeo,
    position: new Vector3((origin[0] * 10) + 5, origin[2] * 10, (origin[1] * 10) + 5),
    scale: new Vector3().setScalar(focused ? 3 : 1)
  })
}

const pointIntersectsBoxShape = (point, boxArea) => {
  const lowerBounds = [
    boxArea.origin[0] - Math.floor(boxArea.width / 2),
    boxArea.origin[1] - Math.floor(boxArea.height / 2),
    boxArea.origin[2] - Math.floor(boxArea.depth / 2),
  ]
  const upperBounds = [
    boxArea.origin[0] + Math.floor(boxArea.width / 2),
    boxArea.origin[1] + Math.floor(boxArea.height / 2),
    boxArea.origin[2] + Math.floor(boxArea.depth / 2),
  ]
  const pointAboveLowerBounds = (
    point[0] >= lowerBounds[0] &&
    point[1] >= lowerBounds[1] &&
    point[2] >= lowerBounds[2]
  )
  const pointBelowUpperBounds = (
    point[0] <= upperBounds[0] &&
    point[1] <= upperBounds[1] &&
    point[2] <= upperBounds[2]
  )
  return pointAboveLowerBounds && pointBelowUpperBounds;
}

const pointIntersectsShape = (point, area) => {
  switch (area.type) {
    case 'box':
      return pointIntersectsBoxShape(point, area)
    default:
      throw new Error();
  }
}

export const BoardInterface/*: Component<{| raycaster: RaycastManager, board: Board |}>*/ = ({
  raycaster, board: { height, width, pieces }
}) => {
  const planeRef = useRef();
  const planeGeo = useGeometry(
    () => new PlaneGeometry(10 * width, 10 * height, 1, 1).rotateX(Math.PI*-0.5),
    [height, width]
  );
  
  const cubeRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [focusedPiece, setFocusedPiece] = useState(null);
  const focusRef = useRef([0, 0, 0]);

  useRaycast2(raycaster, planeRef, {
    enter() {
      setIsFocused(true);
    },
    exit() {
      setIsFocused(false);
    },
  });

  useAnimation(() => {
    if (!isFocused)
      return;
    const { current: intersection } = raycaster.lastIntersectionRef;
    const { current: cube } = cubeRef;
    const { current: plane } = planeRef;
    if (!intersection || !cube || !plane)
      return;
    const localIntersection = plane.worldToLocal(intersection.point);

    const focus = [Math.floor(localIntersection.x / 10), Math.floor(localIntersection.z / 10), 0]
    focusRef.current = focus;
    cube.position.set((focus[0] * 10) + 5, focus[2], (focus[1] * 10) + 5)

    const nextFocusedPiece = pieces.find(piece => {
      return pointIntersectsShape(focus, piece.area);
    });
    if (nextFocusedPiece !== focusedPiece)
      setFocusedPiece(nextFocusedPiece);
    // local space is scaled
    //cube.position.setY(cube.position.y + 5)
  }, [isFocused, raycaster, focusedPiece])
  
  return [
    h(mesh, { ref: planeRef, geometry: planeGeo, visible: false }),
    h(mesh, { ref: cubeRef, geometry: cubeGeo, visible: isFocused }),
    ...pieces.map(piece => h(PieceRenderer, { piece, focused: focusedPiece && focusedPiece.pieceId === piece.pieceId }))
  ];
};
