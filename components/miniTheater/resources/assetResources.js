// @flow strict
/*::
import type {
  MiniTheaterAssetResources,
  MiniTheaterDataResources,
} from "../useMiniTheaterResources";
*/
import { useEffect, useMemo, useState } from "@lukekaalim/act";

import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useAsync } from "../../utils";

/*::
export type ResourceLoadingState =
  | { type: 'nothing-to-load' }
  | { type: 'loading', totalProgress: number }
  | { type: 'loaded' }


export type ResourceLoadingManager = {
  getLoadingState(): ResourceLoadingState,

  addPromises<T>(...promises: Promise<T>[]): void,
};
*/

const findTextureAssets = ({ characters, monsterMasks, assets }) => {
  return [
    [...characters.values()]
      .map(c => c.initiativeIconAssetId),
    [...monsterMasks.values()]
      .map(m => m.initiativeIconAssetId)
  ]
    .flat(1)
    .map(assetId => assetId ? assets.get(assetId) : null)
    .filter(Boolean);
};
const findModelAssets = ({ modelResources, assets }) => {
  return [
    [...modelResources.values()]
      .map(m => m.assetId)
  ]
    .flat(1)
    .map(assetId => assets.get(assetId))
    .filter(Boolean)
};

/*::
export type MiniTheaterAssetResourceLoader = {
  subscribeProgressChanged: (number => mixed) => { unsubscribe(): void },
  subscribeLoaded: (MiniTheaterAssetResources => mixed) => { unsubscribe(): void },

  load: (data: MiniTheaterDataResources) => Promise<MiniTheaterAssetResources>
}
*/
/*::
export type Publisher<T> = {
  subscribe(T => mixed): { unsubscribe(): void },
  emit(T): void,
}
*/
const createPublisher = /*:: <T>*/()/*: Publisher<T>*/ => {
  const subscribers = new Set();
  const subscribe = (handler) => {
    const subscription = {
      handler,
    }
    subscribers.add(subscription);
    const unsubscribe = () => {
      subscribers.delete(subscription);
    }
    return { unsubscribe }
  }
  const emit = (event) => {
    for (const subscription of subscribers)
      subscription.handler(event)
  }
  return { subscribe, emit };
}

export const createMiniTheaterAssetResourceLoader = ()/*: MiniTheaterAssetResourceLoader*/ => {
  const progressPub = createPublisher();
  const loadPub = createPublisher();
      
  const textureLoader = new TextureLoader();
  const gltfLoader = new GLTFLoader();

  const subscribeProgressChanged = (handler) => {
    return progressPub.subscribe(handler);
  }
  const subscribeLoaded = (handler) => {
    return loadPub.subscribe(handler);
  }
  const load = async (data) => {
    try {
      progressPub.emit(0);
    
      const textureAssets = findTextureAssets(data);
      const modelResourceAssets = findModelAssets(data);

      const totalAssets = textureAssets.length + modelResourceAssets.length;
      let progress = 0;

      const countLoad = /*:: <T>*/(t/*: T*/)/*: T*/ => {
        progress += 1/totalAssets;
        progressPub.emit(progress);
        return t;
      }
    
      const [objectEntries, textureEntries] = await Promise.all([
        Promise.all(modelResourceAssets.map(async a => [
          a.description.id,
          (await gltfLoader.loadAsync(a.downloadURL)).scene,
        ]).map(p => (p.then(([, m]) => countLoad(m)), p))),
        Promise.all(textureAssets.map(async i => [
          i.description.id,
          await textureLoader.loadAsync(i.downloadURL)
        ]).map(p => (p.then(([, t]) => countLoad(t)), p))),
      ]);
    
      const objectMap = new Map(objectEntries)
      const textureMap = new Map(textureEntries);

      const resources = {
        meshMap: new Map(),
        materialMap: new Map(),
    
        textureMap,
        objectMap,
        loadingAssets: false,
        loadingProgress: 1,
      };
      loadPub.emit(resources);
    
      return resources;
    } finally {
      progressPub.emit(1);
    }
  }

  return {
    subscribeProgressChanged,
    subscribeLoaded,
    load
  }
}

export const useMiniTheaterAssetResources = (
  data/*: ?MiniTheaterDataResources*/
)/*: MiniTheaterAssetResources*/ => {
  const [loader] = useState/*:: <MiniTheaterAssetResourceLoader>*/(
    () => createMiniTheaterAssetResourceLoader()
  );
  const [loadingProgress, setProgress] = useState(0);
  useEffect(() => {
    const sub = loader.subscribeProgressChanged(setProgress);
    return () => sub.unsubscribe();
  }, [loader])

  const [
    miniTheaterAssetResources,
    miniTheaterAssetResourcesError,
  ] = useAsync(async () => data && loader.load(data), [data]);
  useEffect(() => {
    if (!miniTheaterAssetResourcesError)
      return;
    console.error(miniTheaterAssetResourcesError);
  }, [miniTheaterAssetResourcesError])

  return  useMemo(() => ({
    ...(miniTheaterAssetResources || defaultMiniTheaterAssetResources),
    loadingProgress
  }), [loadingProgress, miniTheaterAssetResources]);
}

export const defaultMiniTheaterAssetResources/*: MiniTheaterAssetResources*/ = {
  meshMap: new Map(),
  materialMap: new Map(),

  textureMap: new Map(),
  objectMap: new Map(),
  loadingAssets: true,
  loadingProgress: 0,
}