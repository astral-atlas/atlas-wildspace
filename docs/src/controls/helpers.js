// @flow strict
/*:: import type { Component, Ref } from '@lukekaalim/act'; */
/*:: import type { Object3D, Mesh, Group, Material } from "three"; */
import { h, useEffect, useRef } from '@lukekaalim/act';
// $FlowFixMe
import { GridHelper, Box3Helper, Vector3, Box3 } from "three";

import { group } from "@lukekaalim/act-three";

export const useHelper = /*:: <T: Object3D, Parent: Object3D>*/(
  parentRef/*: Ref<?Parent>*/,
  helperConstructor/*: () => T*/,
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    const { current: scene } = parentRef;
    if (!scene)
      return;
    
    const object = helperConstructor();
    scene.add(object);
  
    return () => {
      scene.remove(object);
    }
  }, deps);
}

export const GridHelperGroup/*: Component<{ size?: number, interval?: number }>*/ = ({
  size = 100,
  interval = 10
}) => {
  const ref = useRef();
  useHelper(ref, () => {
    return new GridHelper(size, interval);
  }, [size, interval]);

  return h(group, { ref })
};

export const BoxHelperGroup/*: Component<{
  ref: Ref<?Group>,
  material?: Material,
  center?: [number, number, number],
  size?: [number, number, number]
}>*/ = ({
  ref,
  material,
  center = [0, 0, 0],
  size = [10, 10, 10],
}) => {
  useHelper(ref, () => {
    const box = new Box3();
    box.setFromCenterAndSize(
      new Vector3(0, 0, 0),
      new Vector3(...size)
    );
    const helper = new Box3Helper(box);
    if (material)
      helper.material = material;
    return helper;
  }, [...center, ...size, material]);

  return h(group, { ref })
};