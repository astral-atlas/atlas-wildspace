// @flow strict

import { h } from "@lukekaalim/act";
import testImgUrl from './target_icon.png';

/*::
export type SharedImageMapLayer = {
  type: 'shared-image',
  key: string,
  offset: [number, number]
}

export type MapLayer =
  | SharedImageMapLayer


export type MapID = string;
export type MapVersionID = string;
export type Map = {
  id: MapID,
  version: MapVersionID,
  layers: MapLayer[],
};
*/

const sharedImages = {
  'test': testImgUrl
};

export const SharedImageMapLayerRenderer = ({ layer }) => {
  const src = sharedImages[layer.key];
  const transform = `translate(${layer})`;
  return h('img', { src, style: { transform } });
}

export const MapLayerRenderer = ({ layer, map }) => {
  switch (layer.type) {
    case 'shared-image':
      return h(SharedImageMapLayerRenderer, { layer });
    default:
      throw new Error();
  }
}

export const MapRenderer = ({ map }) => {
  return [
    map.layers.map(layer => h(MapLayerRenderer, { layer, map }))
  ]
}

const exampleMap = {
  id: 'example',
  version: '0',
  layers: [
    { type: 'shared-image', key: 'test', offset: [0, 0] }
  ]
};

export const MapDemo = () => {
  return h(MapRenderer, { map: exampleMap });
};
