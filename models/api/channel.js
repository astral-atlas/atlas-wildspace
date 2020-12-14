// @flow strict
/*:: import type { ActiveTrackEvent } from '../audio'; */
const { toActiveTrackEvent } = require('../audio');
// An "Event Channel" is a Bidirectional
// message protocol, with explicit client and server roles

/*::
export type Channel<ServerEvent, ClientEvent> = {
  toClientEvent: mixed => ClientEvent,
  toServerEvent: mixed => ServerEvent,
};
*/

const activeTrackChannel/*: Channel<ActiveTrackEvent, ActiveTrackEvent>*/ = {
  toClientEvent: toActiveTrackEvent,
  toServerEvent: toActiveTrackEvent,
};

module.exports = {
  activeTrackChannel,
};
