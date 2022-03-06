// @flow strict

/*:: import type { Object3D } from "three"; */

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

export const rotateVector = (
  acceleration/*: [number, number]*/,
  rotation/*: number*/
)/*: [number, number]*/ => {
  const radians = rotation * Math.PI * 2;
  const forward = [
    Math.cos(radians),
    Math.sin(radians)
  ];
  const right = [
    Math.cos(radians + (Math.PI/2)),
    Math.sin(radians + (Math.PI/2))
  ];
  return [
    (forward[0] * acceleration[1]) + (acceleration[0] * right[0]),
    (forward[1] * acceleration[1]) + (acceleration[0] * right[1]),
  ]
}