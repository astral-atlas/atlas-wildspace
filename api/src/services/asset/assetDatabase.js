// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { Asset, AssetURL, AssetID, AudioAssetID, AudioAsset, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../../tables'; */
/*:: import type { AssetURLService } from './assetURL'; */
const { v4: uuid } = require('uuid');
const { NonexistentResourceError, InvalidPermissionError } = require("../../errors");

/*::
export type AssetDatabaseService = {
  getAsset: (assetId: AssetID) => Promise<Asset>, 
  addAudioAsset: (user: User, name: string, contentType: string) => Promise<AudioAsset>,
  listAudioAssets: (user: User) => Promise<AudioAsset[]>,
  getAudioAsset: (id: AudioAssetID) => Promise<AudioAsset>,
};
*/

const createAssetDatabaseService = (tables/*: Tables*/, urlService/*: AssetURLService*/)/*: AssetDatabaseService*/ => {
  const getAsset = async (assetId) => {
    const [asset] = await tables.asset.assets.select({ assetId });
    if (!asset)
      throw new NonexistentResourceError('Asset(assetId)', 'ID is not found');
    return asset;
  };
  const getAudioAsset = async (audioAssetId) => {
    const joinedAssets = await tables.asset.joinedAudioAssets.select({ 'audioAssets.audioAssetId': audioAssetId });
    const [joinedAsset] = joinedAssets;

    if (!joinedAsset)
      throw new NonexistentResourceError('Asset(assetId)', 'ID is not found');
    const url = await urlService.createGETAssetURL(joinedAsset.assetId);
    return {
      ...joinedAsset,
      url,
    };
  };
  const listAudioAssets = async (user) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('ListAudioAssets', 'Only GMs can list Assets');
    const joinedRows = await tables.asset.joinedAudioAssets.select({});
    return await Promise.all(joinedRows.map(async (row) => ({
      ...row,
      url: await urlService.createGETAssetURL(row.assetId)
    })));
  };
  const addAsset = async (user, name, contentType) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('CreateAudioAsset', 'Only GMs can create Assets');
    const newAsset = {
      assetId: uuid(),
      contentType,
      name,
      lastModified: Date.now(),
    };
    await tables.asset.assets.insert([newAsset]);
    return newAsset;
  }; 
  const addAudioAsset = async (user, name, contentType) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('CreateAudioAsset', 'Only GMs can create Audio Assets');
    const newAsset = {
      assetId: uuid(),
      contentType,
      name,
      lastModified: Date.now(),
    };
    const newAudioAsset = {
      assetId: newAsset.assetId,
      audioAssetId: uuid(),
    };
    await tables.asset.assets.insert([newAsset]);
    await tables.asset.audioAssets.insert([newAudioAsset]);
    return await getAudioAsset(newAudioAsset.audioAssetId);
  };

  return {
    addAsset,
    getAsset,
    addAudioAsset,
    getAudioAsset,
    listAudioAssets,
  };
};

module.exports = {
  createAssetDatabaseService,
};
