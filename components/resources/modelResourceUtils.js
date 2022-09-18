// @flow strict

/*::
import type { ModelResourcePath } from "@astral-atlas/wildspace-models";
import type { Object3D } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
*/


export const getObject3DForModelResourcePath = (root/*: Object3D*/, path/*: ModelResourcePath*/)/*: ?Object3D*/ => {
  console.log(root, path);
  if (path.length === 0)
    return root;

  const searchPath = path[0];

  const nextChild = root.children.find(c => c.name === searchPath);
  if (!nextChild)
    return null;
  return getObject3DForModelResourcePath(nextChild, path.slice(1));
}