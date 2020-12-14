// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { AssetURL, AssetID, AudioAssetID, AudioAsset, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../../tables'; */
const { v4: uuid } = require('uuid');
const { NonexistentResourceError, InvalidPermissionError } = require("../../errors");

/*::
export type AssetDatabaseService = {
  addAudioAsset: (user: User, name: string, contentType: string) => Promise<AudioAsset>,

  listAudioAssets: (user: User) => Promise<AudioAsset[]>,
  getAudioAsset: (id: AudioAssetID) => Promise<AudioAsset>,
};
*/

const createAssetDatabaseService = (tables/*: Tables*/)/*: AssetDatabaseService*/ => {
  const getAudioAsset = async (audioAssetId) => {
    const [firstAsset] = await tables.asset.audioAssets.select({ audioAssetId });
    if (!firstAsset)
      throw new NonexistentResourceError('AudioAsset(audioAssetId)', 'ID is not found');
    return firstAsset;
  };
  const listAudioAssets = async (user) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('ListAudioAssets', 'Only GMs can list Assets');
    const audioAssets = await tables.asset.audioAssets.select({});
    return audioAssets;
  };
  const addAudioAsset = async (user, name, contentType) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('CreateAudioAsset', 'Only GMs can create Audio Assets');
    const newAsset = {
      assetId: uuid(),
      contentType,
      name,
      audioAssetId: uuid(),
      lastModified: Date.now(),
    };
    await tables.asset.audioAssets.insert([newAsset]);
    return newAsset;
  }; 

  return {
    addAudioAsset,
    getAudioAsset,
    listAudioAssets,
  };
};

module.exports = {
  createAssetDatabaseService,
};
