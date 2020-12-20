// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { AssetID, AssetURL } from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../../tables'; */
const cryptoRandomString = require('crypto-random-string');

/*::
export type AssetURLService = {
  createGETAssetURL: (assetId: AssetID) => Promise<AssetURL>,
  createPOSTAssetURL: (assetId: AssetID) => Promise<AssetURL>,
};
*/
const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;
const hour = 60 * minute;

const createLocalAssetURLService = (tables/*: Tables*/)/*: AssetURLService*/ => {
  const createGETAssetURL = async (assetId) => {
    const url = new URL('http://localhost:8080/assets/raw');
    url.search = '?' + new URLSearchParams({ assetId }).toString();
    return url.href;
  };
  const createPOSTAssetURL = async (assetId) => {
    const expires = Date.now() +  (1 * hour);
    const tokenSecret = cryptoRandomString({ length: 16, type: 'url-safe' });
    await tables.asset.assetPushTokens.insert([{ assetId, expires, tokenSecret }])
    const url = new URL('http://localhost:8080/assets/raw');
    url.search = '?' + new URLSearchParams({ assetId, tokenSecret }).toString();
    return url.href;
  };

  return {
    createGETAssetURL,
    createPOSTAssetURL,
  };
};

module.exports = {
  createLocalAssetURLService,
}