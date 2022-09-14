// @flow strict
/*::
import type { Object3D } from "three";
*/
import { Vector2, Vector3, Matrix4, Quaternion } from "three";

export const rotateVector = (
  rotation/*: number*/,
  position/*: [number, number]*/,
)/*: [number, number]*/ => {
  const radians = rotation * Math.PI * 2;

  const forward = [Math.cos(radians), Math.sin(radians)];
  const right = [Math.cos(radians + Math.PI/2), Math.sin(radians + Math.PI/2)];

  return [
    (right[0] * position[0]) + (forward[0] * position[1]),
    (right[1] * position[0]) + (forward[1] * position[1]),
  ];
};

export const setFocusTransform = (
  focusPosition/*: [number, number, number]*/, // x, z
  cameraOffset/*: [number, number, number]*/, // x, y z
  cameraRotation/*: number*/,
  camera/*: Object3D*/,
) => {
  const radians = cameraRotation * Math.PI * 2;
  const forward = [
    Math.cos(radians),
    Math.sin(radians)
  ];
  const right = [
    Math.cos(radians + Math.PI/2),
    Math.sin(radians + Math.PI/2)
  ]
  const cameraPosition = [
    focusPosition[0] + (forward[0] * -cameraOffset[0]) + (right[0] * 0),
    cameraOffset[1],
    focusPosition[2] + (forward[1] * -cameraOffset[0]) + (right[1] * 0),
  ];

  camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
  camera.lookAt(focusPosition[0], focusPosition[1], focusPosition[2])
}

const up = new Vector3(0, 1, 0);

export const setFocusTransform2 = (
  focusTarget/*: Vector3*/,
  rotation/*: number*/,
  offset/*: Vector2*/,

  subject/*: Object3D*/,
) => {
  subject.position
    .set(offset.x, offset.y, 0)
    .applyAxisAngle(up,  rotation * Math.PI * 2)
    .add(focusTarget)
  subject.lookAt(focusTarget);
};

export const lookAt = (position/*: Vector3*/, target/*: Vector3*/, up/*: Vector3*/)/*: Quaternion*/ => {
  const m1 = new Matrix4();
  m1.lookAt(position, target, up);
  const q1 = new Quaternion();
  q1.setFromRotationMatrix(m1);
  return q1;
}
