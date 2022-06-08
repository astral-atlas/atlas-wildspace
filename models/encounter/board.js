// @flow strict

/*::
import type { BoardPosition, Vector3D } from "./map";

export type BoxBoardArea = {
  size: Vector3D,
  position: Vector3D,
};

export type BoardArea =
  | { type: 'box', box: BoxBoardArea }

export type BoardID = string;
export type Board = {
  id: BoardID,
  floors: $ReadOnlyArray<BoardArea>,
};
*/

export const mergeBoardBoxArea = (boxA/*: BoxBoardArea*/, boxB/*: BoxBoardArea*/)/*: BoxBoardArea*/ => {
  const aMin = calculateBoardBoxMin(boxA);
  const aMax = calculateBoardBoxMax(boxA);
  const bMin = calculateBoardBoxMin(boxB);
  const bMax = calculateBoardBoxMax(boxB);

  const min = {
    x: Math.min(aMin.x, bMin.x),
    y: Math.min(aMin.y, bMin.y),
    z: Math.min(aMin.z, bMin.z),
  };
  const max = {
    x: Math.max(aMax.x, bMax.x),
    y: Math.max(aMax.y, bMax.y),
    z: Math.max(aMax.z, bMax.z),
  }
  return {
    position: {
      x: Math.ceil((min.x + max.x) / 2),
      y: Math.ceil((min.y + max.y) / 2),
      z: Math.ceil((min.z + max.z) / 2),
    },
    size: {
      x: Math.ceil(max.x - min.x),
      y: Math.ceil(max.y - min.y),
      z: Math.ceil(max.z - min.z),
    }
  }
}

export const calculateBoardBoxMin = (box/*: BoxBoardArea*/)/*: BoardPosition*/ => {
  return {
    x: box.position.x - (box.size.x/2),
    y: box.position.y - (box.size.y/2),
    z: box.position.z - (box.size.z/2),
  }
} 
export const calculateBoardBoxMax = (box/*: BoxBoardArea*/)/*: BoardPosition*/ => {
  return {
    x: box.position.x + (box.size.x/2),
    y: box.position.y + (box.size.y/2),
    z: box.position.z + (box.size.z/2),
  }
} 

export const calculateBoardBox = (board/*: Board*/)/*: BoxBoardArea*/ => {
  return board.floors.reduce((acc, curr) => {
    switch (curr.type) {
      case 'box':
        if (!acc)
          return curr.box;
        return mergeBoardBoxArea(curr.box, acc);
      default:
        throw new Error()
    }
  }, { position: { x: 0, y: 0, z: 0 }, size: { x: 0, y: 0, z: 0 }})
}

export const isPointInsideBoardBox = (point/*: Vector3D*/, box/*: BoxBoardArea*/)/*: boolean*/ => {
  const min = calculateBoardBoxMin(box);
  const max = calculateBoardBoxMax(box);

  const withinX = point.x >= min.x && point.x < max.x;
  const withinY = point.y >= min.y && point.y < max.y;
  const withinZ = point.z >= min.z && point.z < max.z;

  return withinX && withinY && withinZ;
}

export const isPointOnBoardFloor = (point/*: Vector3D*/, board/*: Board*/)/*: boolean*/ => {
  return board.floors.some(f => isPointInsideBoardBox(point, f.box))
}