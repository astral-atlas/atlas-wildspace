// @flow strict
/*:: import type { User, Asset, AssetID } from '@astral-atlas/wildspace-models'; */
const { v4: uuid } = require('uuid');
const { NonexistentResourceError, InvalidPermissionError } = require('../errors');

/*::
export type AssetService = {
  list: (user: User) => Promise<{ name: string, type: string, id: AssetID }[]>,
  store: (user: User, type: string, content: Buffer, name: string) => Promise<AssetID>,
  info: (id: AssetID) => Promise<{ name: string, type: string }>,
  retrieve: (id: AssetID) => Promise<Buffer>,
  evict: (user: User, id: AssetID) => Promise<{ name: string, type: string }>,
};
*/

const createMemoryAssetService = ()/*: AssetService*/ => {
  const assetMap = new Map();

  const list = async (user) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('asset list', 'only gms can read the asset list');
    return [...assetMap].map(([id, { name, type }]) => ({ id, name, type }));
  };
  const store = async (user, type, content, name) => {
    if (user.type !== 'game-master');
      //throw new InvalidPermissionError('new asset', 'only gms can create an asset');
    const id = uuid();
    assetMap.set(id, { type, content, name });
    return id;
  };
  const retrieve = async (id) => {
    const asset = assetMap.get(id);
    if (!asset)
      throw new NonexistentResourceError(id, `id does not exist`);
    return asset.content;
  }
  const evict = async (user, id) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError(id, 'only gms can delete an asset');
    const asset = assetMap.get(id);
    if (!asset)
      throw new NonexistentResourceError(id, `id does not exist`);
    assetMap.delete(id);
    return asset;
  };
  const info = async (id) => {
    const asset = assetMap.get(id);
    if (!asset)
      throw new NonexistentResourceError(id, `id does not exist`);
    return {
      name: asset.name,
      type: asset.type,
    };
  };

  return {
    list,
    store,
    retrieve,
    evict,
    info,
  };
};

module.exports = {
  createMemoryAssetService,
};