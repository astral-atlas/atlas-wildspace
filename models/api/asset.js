// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AssetURL, Asset, AssetID, AudioAsset } from '../asset'; */
/*:: import type { APIEndpoint } from './endpoint'; */

const { toAsset, toAssetURL, toAudioAsset, toAssetId } = require("../asset");
const { toObject, toString, toArray } = require("@lukekaalim/cast");
const { createEndpoint } = require("./endpoint");

/*::
export type APIAudioAssetPostResponse = {
  postURL: AssetURL,
  audioAsset: AudioAsset
};
export type APIAudioAssetPostRequest = {
  name: string,
  contentType: string,
};
export type APIAudioAssetGetResponse = AudioAsset[];
*/

const toAPIAudioAssetPostResponse/*: Cast<APIAudioAssetPostResponse>*/ = (value) => {
  const object = toObject(value);
  return {
    postURL: toAssetURL(object.postURL),
    audioAsset: toAudioAsset(object.audioAsset),
  };
};

const toAPIAudioAssetPostRequest/*: Cast<APIAudioAssetPostRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    name: toString(object.name),
    contentType: toString(object.contentType),
  };
};

const toAPIAudioAssetGetResponse/*: Cast<APIAudioAssetGetResponse>*/ = (value) => {
  return toArray(value).map(toAudioAsset);
};

const postAudioAssetEndpoint/*: APIEndpoint<APIAudioAssetPostRequest, APIAudioAssetPostResponse, {}>*/ = createEndpoint(
  'POST', '/assets/audio',
  () => ({}),
  toAPIAudioAssetPostRequest, toAPIAudioAssetPostResponse,
);
const getAudioAssetEndpoint/*: APIEndpoint<null, APIAudioAssetGetResponse, {}>*/ = createEndpoint(
  'GET', '/assets/audio',
  () => ({}),
  () => null, toAPIAudioAssetGetResponse,
);

module.exports = {
  toAPIAudioAssetPostResponse,
  toAPIAudioAssetPostRequest,
  postAudioAssetEndpoint,
  getAudioAssetEndpoint,
};