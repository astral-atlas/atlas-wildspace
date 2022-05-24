// @flow strict
/*::
import type { Context } from "@lukekaalim/act";
*/
import { createContext, useContext, useEffect, useState } from "@lukekaalim/act";

import {
  BufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  TextureLoader,
} from "three";

import resourcesModelURL from './models/resources.glb';
import resourcesTextureURL from './textures/resources.png';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/*::
export type EncounterResources = {
  texture: Texture,
  cursorGeometry: BufferGeometry,
  floatingScene: Object3D,
}
*/

const defaultResource = {
  texture: new Texture(),
  cursorGeometry: new BufferGeometry(),
  floatingScene: new Object3D(),
}

export const resourcesContext/*: Context<EncounterResources>*/ = createContext(defaultResource);

export const useResourcesLoader = ()/*: EncounterResources*/ => {
  const [resources, setResources] = useState/*:: <EncounterResources>*/(defaultResource);

  useEffect(() => {
    const loader = new GLTFLoader();
    const texture = new TextureLoader()
      .load(resourcesTextureURL, (texture) => {
        texture.flipY = false;
        setResources(r => ({
          ...r,
          texture,
        }))
      });


    loader.load(resourcesModelURL, async function ( gltf ) {
      const { children } = gltf.scene;
      const cursor = children.find(c => c.name === 'cursor');
      const floating = children.find(c => c.name === 'floating_scene');
      const bigRock = children.find(c => c.name === 'big_rock');
      const cursorGeometry = cursor && cursor instanceof Mesh && cursor.geometry || resources.cursorGeometry;
      const floatingScene = floating || resources.floatingScene;

      if (floating) {
        const ground = floating.children.find(c => c.name === 'ground');
        if (ground && ground instanceof Mesh) {
          ground.material = new MeshStandardMaterial({ map: texture });
          ground.receiveShadow = true;
          ground.castShadow = true;
        }
      }

      setResources(r => ({
        ...r,
        cursorGeometry,
        floatingScene
      }))
    } );
  }, []);

  return resources;
}