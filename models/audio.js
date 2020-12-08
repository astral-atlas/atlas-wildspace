// @flow strict
/*:: import type { UUID } from './id'; */
/*:: import type { GameID } from './game'; */

const { toObject, toString, toNumber, toConstant, toNullable } = require("./casting");
const { toGame, toGameID } = require("./game");
const { toUUID } = require("./id");

/*::
type HTTPAudioSourceID = UUID;
type HTTPAudioSource = {
  id: HTTPAudioSourceID,
  resource: string,
};

type AudioSource =
  { type: 'http', id: HTTPAudioSourceID };

type BackgroundAudioTrackID = UUID;
type BackgroundAudioTrack = {
  id: BackgroundAudioTrackID,
  name: string,
  gameId: GameID,
  source: HTTPAudioSourceID,
};

// Update active
type ActiveTrackUpdateEvent = {
  type: 'update',
  distanceSeconds: number,
  trackId: null | BackgroundAudioTrackID,
  fromUnixTime: number,
};

type ActiveTrackEvent =
  | ActiveTrackUpdateEvent

export type {
  ActiveTrackEvent,
  ActiveTrackUpdateEvent,

  AudioSource,
  HTTPAudioSourceID,
  HTTPAudioSource,
  BackgroundAudioTrackID,
  BackgroundAudioTrack,
};
*/
const toHTTPAudioSourceID = (value/*: mixed*/)/*: HTTPAudioSourceID*/ => toUUID(value);
const toHTTPAudioSource = (value/*: mixed*/)/*: HTTPAudioSource*/ => {
  const object = toObject(value);
  return {
    id: toHTTPAudioSourceID(object.id),
    resource: toString(object.resource),
  };
}

const toBackgroundAudioTrackID = (value/*: mixed*/)/*: BackgroundAudioTrackID*/ => toUUID(value);
const toBackgroundAudioTrack = (value/*: mixed*/)/*: BackgroundAudioTrack*/ => {
  const object = toObject(value);
  return {
    id: toBackgroundAudioTrackID(object.id),
    name: toString(object.name),
    gameId: toGameID(object.gameId),
    source: toHTTPAudioSourceID(object.source),
  }
}

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

module.exports = {
  toHTTPAudioSourceID,
  toHTTPAudioSource,
  toBackgroundAudioTrackID,
  toBackgroundAudioTrack,

  toActiveTrackEvent,
  toActiveTrackUpdateEvent,
}