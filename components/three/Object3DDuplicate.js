// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
import type { Material, Object3D } from "three";
*/
import { h, useEffect, useRef } from "@lukekaalim/act";
import { mesh } from "@lukekaalim/act-three";
import { Color, Mesh, MeshBasicMaterial } from "three";


/*::
export type DuplicateContext = {
  materials: Map<string, Material>,
};

export type Object3DDuplicateProps = {
  target: Object3D,

  context: DuplicateContext,
}
*/

export const Object3DDuplicate/*: Component<Object3DDuplicateProps>*/ = ({ target, context }) => {
  if (target instanceof Mesh)
    return h(MeshDuplicate, { target, context })
  
  return target.children.map(target =>
    h(Object3DDuplicate, { key: target.id, target, context }));
}

const fallbackMaterial = new MeshBasicMaterial({ color: new Color('pink') });

const MeshDuplicate = ({ target, context }) => {

  const getMaterial = (placeholderMaterial) => {
    if (!placeholderMaterial)
      return null;
    if (!placeholderMaterial.name)
      return null;
    return context.materials.get(placeholderMaterial.name);
  }
  const getMaterialArray = (targetMaterialArray) => {
    const materials = targetMaterialArray
      .map(getMaterial)
      .filter(Boolean);
    if (materials.length === 0)
      return fallbackMaterial;
    return materials;
  }
  
  const targetMaterial = target.material;

  const material = Array.isArray(targetMaterial) ? getMaterialArray(targetMaterial) : (getMaterial(targetMaterial) || fallbackMaterial);

  const ref = useRef();
  useEffect(() => {
    console.log(ref);
  }, [])

  // $FlowFixMe
  return h(mesh, { geometry: target.geometry, material, ref, rotation: target.rotation, scale: target.scale }, [
    target.children.map(target =>
      h(Object3DDuplicate, { key: target.id, target, context }))
  ])
}