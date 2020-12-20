// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { BackgroundAudioTrack, BackgroundAudioTrackID } from '../audio'; */
/*:: import type { AudioAsset } from '../asset'; */
/*:: import type { GameID } from '../game'; */
/*:: import type { Channel } from './channel'; */
/*:: import type { APIEndpoint } from './endpoint'; */
const { toObject, toArray, toNumber, toConstant, toNullable } = require('@lukekaalim/cast');
const { toAudioAsset } = require('../asset');
const { toBackgroundAudioTrack, toBackgroundAudioTrackID } = require('../audio');
const { toGameID } = require('../game');

/*::
// Update active
export type ActiveTrackUpdateEvent = {
  type: 'update',
  distanceSeconds: number,
  trackId: null | BackgroundAudioTrackID,
  fromUnixTime: number,
};

export type ActiveTrackEvent =
  | ActiveTrackUpdateEvent

export type ActiveTrackQuery = {
  gameId: GameID,
};
*/

const toActiveTrackUpdateEvent = (value/*: mixed*/)/*: ActiveTrackUpdateEvent*/ => {
  const object = toObject(value);
  return {
    type: toConstant(object.type, 'update'),
    distanceSeconds: toNumber(object.distanceSeconds),
    fromUnixTime: toNumber(object.fromUnixTime),
    trackId: toNullable(object.trackId, toBackgroundAudioTrackID),
  };
};

const toActiveTrackEvent = (value/*: mixed*/)/*: ActiveTrackEvent*/ => {
  const object = toObject(value);
  switch (object.type) {
    case 'update':
      return toActiveTrackUpdateEvent(object);
    default:
      throw new TypeError();
  }
};

const toActiveTrackQuery/*: Cast<ActiveTrackQuery>*/ = (value) => {
  const object = toObject(value);
  return {
    gameId: toGameID(object.gameId),
  };
}
 
const activeTrackChannel/*: Channel<ActiveTrackEvent, ActiveTrackEvent, ActiveTrackQuery>*/ = {
  path: '/game/tracks/active/events',
  toQuery: toActiveTrackQuery,
  toClientEvent: toActiveTrackEvent,
  toServerEvent: toActiveTrackEvent,
};

/*::
export type APIGameAudioGetResponse = {
  tracks: BackgroundAudioTrack[],
};
export type APIGameAudioGetQuery = {
  gameId: GameID,
};
*/
const toAPIGameAudioGetResponse/*: Cast<APIGameAudioGetResponse>*/ = (value) => {
  const object = toObject(value);
  return {
    tracks: toArray(object.tracks).map(toBackgroundAudioTrack)
  };
};
const toAPIGameAudioGetQuery/*: Cast<APIGameAudioGetQuery>*/ = (value) => {
  const object = toObject(value);
  return {
    gameId: toGameID(object.gameId),
  };
};

const getGameAudioEndpoint/*: APIEndpoint<null, APIGameAudioGetResponse, APIGameAudioGetQuery>*/ = {
  path: '/game/audio',
  method: 'GET',
  toQuery: toAPIGameAudioGetQuery,
  toResponseBody: toAPIGameAudioGetResponse,
  toRequestBody: () => null,
};

module.exports = {
  activeTrackChannel,
  getGameAudioEndpoint,

  toActiveTrackEvent,
  toActiveTrackUpdateEvent,
}