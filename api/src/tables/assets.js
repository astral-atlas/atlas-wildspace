// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type {
  Asset, AssetID,
  AudioAsset, AudioAssetID,
} from '@astral-atlas/wildspace-models'; */
/*:: import type { Table, ReadableTable, WritableTable } from '../services/table'; */
const { toAsset, toAssetId, toAudioAssetId } = require("@astral-atlas/wildspace-models");
const { toObject, toString, toNumber } = require("@lukekaalim/cast");
const { createFileTable, memoryJoin } = require("../services/table");

/*::
export type AssetTables = {
  assets: Table<{ assetId?: AssetID }, Asset>,
  assetPushTokens: Table<{ assetId?: AssetID }, { assetId: AssetID, expires: number, token: string }>,
  audioAssets: Table<{ audioAssetId?: AudioAssetID }, AudioAsset>,
};
*/

/*:: type AudioAssetRef = {| assetId: AssetID, audioAssetId: AudioAssetID |}; */
const toAudioAssetRef/*: Cast<AudioAssetRef>*/ = (value) => {
  const object = toObject(value);
  return {
    assetId: toAssetId(object.assetId),
    audioAssetId: toAudioAssetId(object.audioAssetId),
  }
};

const createAssetTables = async ()/*: Promise<AssetTables>*/ => {
  // generic assets
  const assets = await createFileTable(
    './data/assets.json',
    toAsset,
    (a, b) => a.assetId === b.assetId
  );
  // specific audio asset
  const audioAssetRefs/*: Table<{ audioAssetId?: AudioAssetID }, AudioAssetRef>*/ = await createFileTable(
    './data/assets/audio.json',
    toAudioAssetRef,
    (a, b) => (a.audioAssetId === b.audioAssetId) || (a.assetId === b.assetId),
  );
  const audioAssets = memoryJoin(assets, audioAssetRefs,
    () => ({}), k => ({ audioAssetId: k.audioAssetId }),
    (a, b) => ({ ...a, ...b }),
    j => ({ ...j }), j => ({ assetId: j.assetId, audioAssetId: j.audioAssetId })
  );

  const assetPushTokens = await createFileTable(
    './data/assets/tokens.json',
    (value) => {
      const object = toObject(value);
      return {
        assetId: toAssetId(object.assetId),
        token: toString(object.token),
        expires: toNumber(object.expires),
      };
    },
    (a, b) => a.assetId === b.assetId,
  );

  return {
    assets,
    audioAssets,
    assetPushTokens,
  };
};

module.exports = {
  createAssetTables,
}