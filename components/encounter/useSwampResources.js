// @flow strict
/*::
import type { Object3D, Scene, Texture } from "three";
*/
import swampTextureURL from './textures/swamp_resources.png';
import swampModelURL from './models/swamp_resources.glb';
import { useDisposable } from "@lukekaalim/act-three/hooks";
import { TextureLoader, sRGBEncoding } from "three";
import { useAsync } from "../utils/async";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*::
export type SwampResources = {
  swampTexture: Texture,
  swampModel: Scene,
};
*/

export const useSwampResources = ()/*: ?SwampResources*/ => {
  const swampTexture = useDisposable(() => {
    return new TextureLoader().load(swampTextureURL, (loadedTexture) => {
      loadedTexture.encoding = sRGBEncoding;
      loadedTexture.flipX = false;
      loadedTexture.flipY = false;
    });
  }, []);
  const [swampModel] = useAsync(() => {
    return new Promise(resolve => {
      new GLTFLoader()
        .load(swampModelURL, gltf => resolve(gltf.scene))
    });
  }, [])

  return swampModel && {
    swampTexture,
    swampModel,
  }
}