// @flow strict

/*::
import type { Vector3D } from "./map";

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
  const lower = {
    x: Math.min(boxA.position.x - (boxA.size.x/2), boxB.position.x - (boxB.size.x/2)),
    y: Math.min(boxA.position.y - (boxA.size.y/2), boxB.position.y - (boxB.size.y/2)),
    z: Math.min(boxA.position.z - (boxA.size.z/2), boxB.position.z - (boxB.size.z/2)),
  };
  const upper = {
    x: Math.max(boxA.position.x + (boxA.size.x/2), boxB.position.x + (boxB.size.x/2)),
    y: Math.max(boxA.position.y + (boxA.size.y/2), boxB.position.y + (boxB.size.y/2)),
    z: Math.max(boxA.position.z + (boxA.size.z/2), boxB.position.z + (boxB.size.z/2)),
  }
  return {
    position: {
      x: (lower.x + upper.x) / 2,
      y: (lower.y + upper.y) / 2,
      z: (lower.z + upper.z) / 2,
    },
    size: {
      x: upper.x - lower.x,
      y: upper.y - lower.y,
      z: upper.z - lower.z,
    }
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
  const withinX = (point.x <= box.position.x + (box.size.x/2)) && (point.x >= box.position.x - (box.size.x/2));
  const withinY = point.y <= box.position.y + (box.size.y/2) && point.y >= box.position.y - (box.size.y/2);
  const withinZ = point.z <= box.position.z + (box.size.z/2) && point.z >= box.position.z - (box.size.z/2);

  const lowerThan = box.position.x + (box.size.x/2);
  const higherThan = box.position.x - (box.size.x/2)

  return withinX && withinY && withinZ;
}

export const isPointOnBoardFloor = (point/*: Vector3D*/, board/*: Board*/)/*: boolean*/ => {
  return board.floors.some(f => isPointInsideBoardBox(point, f.box))
}