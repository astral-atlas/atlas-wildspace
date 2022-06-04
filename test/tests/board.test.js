// @flow strict
/*::
import type { Assertion } from "@lukekaalim/test";
*/
import { mergeBoardBoxArea, isPointInsideBoardBox } from '@astral-atlas/wildspace-models';
import { assert, assertStruct } from '@lukekaalim/test';

export const assertBoard = ()/*: Assertion*/ => {
  return assert('Board', [
    assertBoxBoardMerge(),
    assertPointInside(),
  ])
};

const assertBoxBoardMerge = () => {
  const boxA = { position: { x: 1, y: 0, z: 0 }, size: { x: 1, y: 0, z: 0} };
  const boxB = { position: { x: 5, y: 0, z: 0 }, size: { x: 2, y: 0, z: 0} };

  const boxAandB = { position: { x: 3, y: 0, z: 0 }, size: { x: 5, y: 0, z: 0} };

  return assert('Box Board Merge', [
    assertStruct({ merged: mergeBoardBoxArea(boxA, boxB), expected: boxAandB })
  ])
}
const assertPointInside = () => {
  const boxA = { position: { x: 3, y: 0, z: 0 }, size: { x: 2, y: 1, z: 1} };


  return assert(`point inside box ${JSON.stringify({ position: boxA.position.x, size: boxA.size.x})}`, [
    assert('point=1 is not inside box', !isPointInsideBoardBox({ x: 1, y: 0, z: 0 }, boxA)),
    assert('point=2 is inside box',     isPointInsideBoardBox({ x: 2, y: 0, z: 0 }, boxA)),
    assert('point=3 is inside box',     isPointInsideBoardBox({ x: 3, y: 0, z: 0 }, boxA)),
    assert('point=4 is not inside box', !isPointInsideBoardBox({ x: 4, y: 0, z: 0 }, boxA))
  ])
}