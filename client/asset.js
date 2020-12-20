// @flow strict
/*:: import type { RESTClient, RESTAuthorization } from './rest'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { Asset, AudioAsset, AudioAssetID, AssetID, AssetURL, APIAudioAssetGetResponse } from '@astral-atlas/wildspace-models'; */
const { postAudioAssetEndpoint, getAudioAssetEndpoint } = require('@astral-atlas/wildspace-models');
const { createEndpointClient } = require('./endpoint');
const { getAuthHeader } = require('./rest');
const { toArray, toObject, toString } = require("@lukekaalim/cast");

/*::

export type AssetClient = {
  listAudioAssets: () => Promise<APIAudioAssetGetResponse>,
  addAudioAsset: (name: string, type: string, fileContent: Uint8Array) => Promise<void>,
};
*/

const toAssetList = (value) => {
  return toArray(value).map(value => {
    const object = toObject(value);
    return {
      name: toString(object.name),
      id: toString(object.id),
      type: toString(object.type),
    }
  })
};

const createAssetClient = (
  rest/*: RESTClient*/,
  auth/*: RESTAuthorization*/,
  rootUrl/*: string*/,
  http/*: HTTPClient*/,
)/*: AssetClient*/ => {
  const postAudioAsset = createEndpointClient(rest, postAudioAssetEndpoint);
  const getAudioAssets = createEndpointClient(rest, getAudioAssetEndpoint);

  const list = async () => {
    const { content } = await rest.get({ resource: '/assets/ids' });
    return toAssetList(content);
  };
  const upload = async (name, type, body) => {
    const url = new URL('/assets/', rootUrl);
    url.search = '?' + new URLSearchParams({ name }).toString();
    const authHeader = getAuthHeader(auth);
    const headers = [
      authHeader,
      ['content-type', type],
      ['content-length', body.byteLength.toString()]
    ].filter(Boolean);
    const response = await http.sendRequest({ url, method: 'POST', headers, body });
    return JSON.parse(response.body);
  };
  const addAudioAsset = async (name, contentType, fileContent) => {
    const { postURL } = await postAudioAsset.request({}, { name, contentType });
    const authHeader = getAuthHeader(auth);
    const headers = [
      authHeader,
      ['content-type', contentType],
      ['content-length', fileContent.byteLength.toString()]
    ].filter(Boolean);
    await http.sendRequest({ url: postURL, method: 'POST', headers, body: fileContent });
  };
  const listAudioAssets = async () => {
    return await getAudioAssets.request({}, null);
  };

  return {
    addAudioAsset,
    listAudioAssets,
  };
};

module.exports = {
  createAssetClient,
}