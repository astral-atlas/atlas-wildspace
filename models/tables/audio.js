// @flow strict
/*:: import type { Cast, Equal } from '@lukekaalim/cast'; */
/*:: import type { GameID } from '../game'; */
/*:: import type { BackgroundAudioTrackID } from '../audio'; */
/*:: import type { AssetID, AudioAssetID } from '../asset'; */

const { toObject, toNumber, toNullable } = require("@lukekaalim/cast");
const { toAssetId, toAudioAssetId } = require("../asset");
const { toBackgroundAudioTrackID } = require("../audio");
const { toString } = require("../casting");
const { toGameID } = require("../game");

/*::
export type ActiveTrackRow = {|
  gameId: GameID,
  distanceSeconds: number,
  trackId: null | BackgroundAudioTrackID,
  fromUnixTime: number,
|};
*/
const toActiveTrackRow/*: Cast<ActiveTrackRow>*/ = (value) => {
  const object = toObject(value);
  return {
    gameId: toGameID(object.gameId),
    distanceSeconds: toNumber(object.distanceSeconds),
    trackId: toNullable(object.trackId, toBackgroundAudioTrackID),
    fromUnixTime: toNumber(object.fromUnixTime),
  };
};
const isEqualActiveTrackRow/*: Equal<ActiveTrackRow>*/ = (a, b) => a.gameId === b.gameId;

/*::
export type AudioAssetRow = {|
  assetId: AssetID,
  audioAssetId: AudioAssetID,
|}
*/
/*::
export type AssetRow = {|
  assetId: string,
  name: string,
  lastModified: number,
  contentType: string,
|}
*/
const toAudioAssetRow/*: Cast<AudioAssetRow>*/ = (value) => {
  const object = toObject(value);
  return {
    assetId: toAssetId(object.assetId),
    audioAssetId: toAudioAssetId(object.audioAssetId),
  };
};
const toAssetRow/*: Cast<AssetRow>*/ = (value) => {
  const object = toObject(value);
  return {
    assetId: toAssetId(object.assetId),
    name: toString(object.name),
    contentType: toString(object.contentType),
    lastModified: toNumber(object.lastModified),
  };
};

module.exports = {
  toActiveTrackRow,
  isEqualActiveTrackRow,

  toAudioAssetRow,
  toAssetRow,
};