// @flow strict
/*:: import type { UUID } from './id'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toObject, toString, toNumber } = require('@lukekaalim/cast');
const { toUUID } = require('./id');
/*::
export type AssetURL = string;
export type AssetID = UUID;
export type Asset = {
  assetId: string,
  name: string,
  lastModified: number,
  contentType: string,
};

export type AudioAssetID = UUID;
export type AudioAsset = {
  ...Asset,
  audioAssetId: AudioAssetID,
};
*/
const toAssetURL/*: Cast<AssetURL>*/ = toString;

const toAssetId/*: Cast<AssetID>*/ = toUUID;
const toAsset/*: Cast<Asset>*/ = (value) => {
  const object = toObject(value);
  return {
    assetId: toAssetId(object.assetId),
    name: toString(object.name),
    lastModified: toNumber(object.lastModified),
    contentType: toString(object.contentType),
  };
};


const toAudioAssetId/*: Cast<AudioAssetID>*/ = toUUID;
const toAudioAsset/*: Cast<AudioAsset>*/ = (value) => {
  const object = toObject(value);
  return {
    ...toAsset(object),
    audioAssetId: toAudioAssetId(object.audioId),
  };
};

module.exports ={
  toAssetURL,

  toAssetId,
  toAsset,

  toAudioAssetId,
  toAudioAsset,
};
