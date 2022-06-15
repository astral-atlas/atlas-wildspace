// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { ConnectionDescription } from "@lukekaalim/net-description/connection";
import type { GameID } from "../../game/game";
import type {
  MiniTheater,
  MiniTheaterEvent,
  MiniTheaterID,
} from "../../game/miniTheater";
import type { Character } from "../../character";
import type { AuthorizedConnection } from "../meta";
import type { LibraryEvent } from "../../game";

import type { MiniTheaterChannel } from "./advancedUpdates/miniTheater";
import type { LibraryChannel } from "./advancedUpdates/library";
import type { WikiDocChannel } from "./advancedUpdates/wikiDoc";
import type { RoomPageChannel } from "./advancedUpdates/roomPage";
import type { GamePageChannel } from "./advancedUpdates/gamePage";
import type { GameConnectionID } from "../../game/connection";
*/

import { c } from "@lukekaalim/cast";
import { createAuthorizedConnectionDescription } from "../meta.js";

import {
  castGameConnectionId,
  castGameId,
  castLibraryEvent,
  castMiniTheaterEvent,
  castMiniTheaterId,
} from "../../game.js";
import { miniTheaterChannel } from "./advancedUpdates/miniTheater.js";
import { libraryChannel } from "./advancedUpdates/library.js";
import { wikiDocChannel } from "./advancedUpdates/wikiDoc.js";
import { roomPageChannel } from "./advancedUpdates/roomPage.js";
import { gamePageChannel } from "./advancedUpdates/gamePage.js";

/*::
type Channels = [
  MiniTheaterChannel,
  LibraryChannel,
  WikiDocChannel
];

export type UpdateChannelServerMessage =
  | MiniTheaterChannel["Server"]
  | LibraryChannel["Server"]
  | WikiDocChannel["Server"]
  | RoomPageChannel["Server"]
  | GamePageChannel["Server"]
  | {| type: 'connected', connectionId: GameConnectionID |}

export type UpdateChannelClientMessage = 
  | MiniTheaterChannel["Client"]
  | LibraryChannel["Client"]
  | WikiDocChannel["Client"]
  | RoomPageChannel["Client"]
  | GamePageChannel["Client"]


type AdvancedUpdates = AuthorizedConnection<{|
  server: UpdateChannelServerMessage,
  client: UpdateChannelClientMessage,
  query: { gameId: GameID }
|}>;

export type AdvancedUpdatesAPI = {|
  '/games/updates-advanced': AdvancedUpdates
|}
*/

const channels = [
  miniTheaterChannel,
  libraryChannel,
  wikiDocChannel,
  roomPageChannel,
  gamePageChannel,
]

const castTypedObject = c.obj({ type: c.str });
const getChannelForValue = (value) => {
  const { type } = castTypedObject(value);
  const channel = channels.find(c => type.startsWith(c.eventPrefix));
  if (!channel)
    throw new Error(`Unknown type of update`);
  return channel;
}
const castConnectedEvent = c.obj({ type: c.lit('connected'), connectionId: castGameConnectionId })


const advancedUpdates/*: ConnectionDescription<AdvancedUpdates>*/ = createAuthorizedConnectionDescription({
  path: '/games/updates-advanced',
  
  castQuery: c.obj({ gameId: castGameId }),
  castServerMessage: value => {
    if (typeof value === 'object' && value !== null && value.type === 'connected')
      return castConnectedEvent(value);
    const channel = getChannelForValue(value);
    return channel.castServerEvent(value);
  },
  castClientMessage: value => {
    const channel = getChannelForValue(value);
    return channel.castClientEvent(value);
  }
})

export const advancedUpdatesAPI = {
  '/games/updates-advanced': advancedUpdates
};
export * from './advancedUpdates/meta.js';
export * from './advancedUpdates/library.js';
export * from './advancedUpdates/wikiDoc.js';
export * from './advancedUpdates/miniTheater.js';
export * from './advancedUpdates/roomPage.js';
export * from './advancedUpdates/gamePage.js';