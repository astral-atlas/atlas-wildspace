// @flow strict
/*:: import type { AssetID, AssetURL } from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../../tables'; */

/*::
export type RemoteAssetServer = {
  createGETAssetURL: (assetId: AssetID) => Promise<AssetURL>,
  createPOSTAssetURL: (assetId: AssetID) => Promise<AssetURL>,

  deleteAsset: (assetId: AssetID) => Promise<void>,
};
*/

const createRemoveAssetService = (tables/*: Tables*/)/*: RemoteAssetServer*/ => {
  const createGETAssetURL = async (assetId) => {

  };

  return {
    createGETAssetURL,
  };
};