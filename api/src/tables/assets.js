// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { ReadWriteTable, JoinedTable } from '@astral-atlas/table'; */
/*:: import type {
  Asset, AssetID,
  AudioAsset, AudioAssetID,
  AudioAssetRow, AssetRow,
} from '@astral-atlas/wildspace-models'; */
const { toAsset, toAssetId, toAudioAsset, toAssetRow, toAudioAssetRow } = require("@astral-atlas/wildspace-models");
const { createFileTable, createMemoryJoinTable } = require('@astral-atlas/table')
const { toObject, toString, toNumber } = require("@lukekaalim/cast");

/*::
export type AssetTables = {
  assets: ReadWriteTable<AssetRow>,
  assetPushTokens: ReadWriteTable<AssetPushToken>,
  audioAssets: ReadWriteTable<AudioAssetRow>,

  joinedAudioAssets: JoinedTable<{| ...AssetRow, ...AudioAssetRow |}>
};
*/

/*:: export type AssetPushToken = { assetId: AssetID, expires: number, tokenSecret: string }; */
const toAssetPushToken/*: Cast<AssetPushToken>*/ = (value) => {
  const object = toObject(value);
  return {
    assetId: toAssetId(object.assetId),
    expires: toNumber(object.expires),
    tokenSecret: toString(object.tokenSecret),
  };
};

const createAssetTables = async ()/*: Promise<AssetTables>*/ => {
  // generic assets
  const assets = await createFileTable('assets', './data/assets.json', toAssetRow);
  const assetPushTokens = await createFileTable('assetPushTokens', './data/assets/tokens.json', toAssetPushToken);
  
  // specific audio asset
  const audioAssets = await createFileTable('audioAssets', './data/assets/audio.json', toAudioAssetRow);

  const joinedAudioAssets = createMemoryJoinTable(
    assets,
    audioAssets,
    (a, b) => a.assetId === b.assetId ? ({ ...a, ...b }) : null,
  );

  return {
    assets,
    assetPushTokens,
    audioAssets,
    joinedAudioAssets,
  };
};

module.exports = {
  createAssetTables,
}