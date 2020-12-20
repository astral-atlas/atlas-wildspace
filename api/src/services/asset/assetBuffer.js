// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { AssetID, AssetURL, User } from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../../tables'; */
const { InvalidPermissionError } = require('../../errors');
const { readFile, writeFile, mkdir } = require('fs').promises;
const { join } = require('path');

/*::
export type AssetBufferService = {
  write: (user: User, data: Buffer, id: AssetID) => Promise<void>,
  writeWithToken: (tokenSecret: string, currentTime: number, data: Buffer, id: AssetID) => Promise<void>,
  read: (assetId: AssetID) => Promise<Buffer>,
};
*/

const createLocalAssetBufferService = (table/*: Tables*/, directory/*: string*/)/*: AssetBufferService*/ => {
  const write = async (user, data, assetId) => {
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('WriteAsset', 'Only GMs can write assets');
    const filePath = join(directory, assetId);
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, data);
  };
  const writeWithToken = async (tokenSecret, currentTime, data, assetId) => {
    const [validToken] = await table.asset.assetPushTokens.select({ assetId, tokenSecret });
    if (!validToken)
      throw new InvalidPermissionError('WriteAsset', 'AssetID and TokenSecret do not match any stored tokens');
    if (currentTime > validToken.expires)
      throw new InvalidPermissionError('WriteAsset', 'The provided token has expired');

    const filePath = join(directory, assetId);
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, data);
  };
  const read = async (assetId) => {
    const filePath = join(directory, assetId);
    const data = await readFile(filePath);
    return data;
  };

  return {
    write,
    writeWithToken,
    read,
  }
};

module.exports = {
  createLocalAssetBufferService,
};
