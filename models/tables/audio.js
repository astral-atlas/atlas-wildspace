// @flow strict
/*:: import type { Cast, Equal } from '@lukekaalim/cast'; */
/*:: import type { GameID } from '../game'; */
/*:: import type { BackgroundAudioTrackID } from '../audio'; */

const { toObject, toNumber, toNullable } = require("@lukekaalim/cast");
const { toBackgroundAudioTrackID } = require("../audio");
const { toGameID } = require("../game");

/*::
export type ActiveTrackRow = {
  gameId: GameID,
  distanceSeconds: number,
  trackId: BackgroundAudioTrackID,
  fromUnixTime: number,
};
*/
const toActiveTrackRow/*: Cast<ActiveTrackRow>*/ = (value) => {
  const object = toObject(value);
  return {
    gameId: toGameID(object.gameId),
    distanceSeconds: toNumber(object.distanceSeconds),
    trackId: toBackgroundAudioTrackID(object.trackId),
    fromUnixTime: toNumber(object.fromUnixTime),
  };
};
const isEqualActiveTrackRow/*: Equal<ActiveTrackRow>*/ = (a, b) => a.gameId === b.gameId;

module.exports = {
  toActiveTrackRow,
  isEqualActiveTrackRow,
};