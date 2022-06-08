// @flow strict
/*::
import type { Context } from "@lukekaalim/act";
*/
import { createContext, useContext, useEffect, useState } from "@lukekaalim/act";

import {
  BufferGeometry,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  TextureLoader,
  sRGBEncoding,
} from "three";

import resourcesModelURL from './models/resources.glb';
import resourcesTextureURL from './textures/resources.png';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/*::
export type EncounterResources = {
  texture: Texture,
  cursorGeometry: BufferGeometry,
  cursor: Object3D,
  floatingScene: Object3D,
  pirateScene: Object3D,
}
*/

const defaultResource = {
  texture: new Texture(),
  cursorGeometry: new BufferGeometry(),
  floatingScene: new Object3D(),
  cursor: new Object3D(),
  pirateScene: new Object3D(),
}

export const resourcesContext/*: Context<EncounterResources>*/ = createContext(defaultResource);

export const useResourcesLoader = ()/*: EncounterResources*/ => {
  const [resources, setResources] = useState/*:: <EncounterResources>*/(defaultResource);

  useEffect(() => {
    const loader = new GLTFLoader();
    const texture = new TextureLoader()
      .load(resourcesTextureURL, (texture) => {
        texture.flipY = false;
        texture.encoding = sRGBEncoding;
        setResources(r => ({
          ...r,
          texture,
        }))
      });

    const parsePirateScene = (root) => {
      if (!root)
        return new Object3D();

      const testMaterial = new MeshStandardMaterial({ color: new Color('white') });
      const sandMaterial = new MeshStandardMaterial({ color: new Color('#E7A15D') });
      const resourceMaterial = new MeshStandardMaterial({ map: texture })
      
      const parseObject = (object) => {
        if (object instanceof Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          const { material } = object;
          if (material instanceof Material) {
            if (material.name === 'floor')
              object.material = sandMaterial;
            else if (material.name === 'test')
              object.material = testMaterial;
            else
              object.material = resourceMaterial
          }
        }
        return object.children.map(parseObject);
      };

      parseObject(root);

      return root;
    }


    loader.load(resourcesModelURL, async function ( gltf ) {
      const { children } = gltf.scene;
      const cursor = children.find(c => c.name === 'cursor');
      const floating = children.find(c => c.name === 'floating_scene');
      const bigRock = children.find(c => c.name === 'big_rock');
      const pirateScene = parsePirateScene(children.find(c => c.name === 'pirate_stage_1'));
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
        floatingScene,
        pirateScene,
        cursor,
      }))
    } );
  }, []);

  return resources;
}