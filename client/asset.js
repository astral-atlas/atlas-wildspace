// @flow strict
/*:: import type { RESTClient, RESTAuthorization } from './rest'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
const { getAuthHeader } = require('./rest');
const { toArray, toObject, toString } = require("@astral-atlas/wildspace-models/casting");


/*::
export type AssetClient = {
  list: () => Promise<{ name: string, id: string, type: string }[]>,
  upload: (name: string, type: string, data: Uint8Array) => Promise<string>,
  getAssetLink: (assetId: string) => Promise<string>,
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

const createAssetClient = (rest/*: RESTClient*/, auth/*: RESTAuthorization*/, rootUrl/*: string*/, http/*: HTTPClient*/)/*: AssetClient*/ => {
  const list = async () => {
    const { content } = await rest.get({ resource: '/assets/ids' });
    return toAssetList(content);
  };
  const upload = async (name, type, body) => {
    const url = new URL('/assets', rootUrl);
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
  const getAssetLink = async (assetId) => {
    const url = new URL('/assets', rootUrl);
    url.search = '?' + new URLSearchParams({ assetId }).toString();
    return url.href;
  };

  return {
    list,
    upload,
    getAssetLink,
  };
};

module.exports = {
  createAssetClient,
}