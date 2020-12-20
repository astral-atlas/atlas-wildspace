// @flow strict
/*:: import type { UUID } from './id'; */
/*:: import type { GameID } from './game'; */
/*:: import type { AudioAssetID, AudioAsset } from './asset'; */

const { toAudioAsset } = require("./asset");
const { toObject, toString } = require("./casting");
const { toGameID } = require("./game");
const { toUUID } = require("./id");

/*::
type BackgroundAudioTrackID = UUID;
type BackgroundAudioTrack = {
  id: BackgroundAudioTrackID,
  name: string,
  gameId: GameID,
  asset: AudioAsset,
};

export type {
  BackgroundAudioTrackID,
  BackgroundAudioTrack,
};
*/

const toBackgroundAudioTrackID = (value/*: mixed*/)/*: BackgroundAudioTrackID*/ => toUUID(value);
const toBackgroundAudioTrack = (value/*: mixed*/)/*: BackgroundAudioTrack*/ => {
  const object = toObject(value);
  return {
    id: toBackgroundAudioTrackID(object.id),
    name: toString(object.name),
    gameId: toGameID(object.gameId),
    asset: toAudioAsset(object.asset),
  }
}

module.exports = {
  toBackgroundAudioTrackID,
  toBackgroundAudioTrack,
};
