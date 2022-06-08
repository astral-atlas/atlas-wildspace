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

/*::
type Channels = [
  MiniTheaterChannel,
  LibraryChannel,
  WikiDocChannel
];

export type LibraryServerUpdate =
  | MiniTheaterChannel["Server"]
  | LibraryChannel["Server"]
  | WikiDocChannel["Server"]
  | {| type: 'connected', connectionId: GameConnectionID |}

export type LibraryClientUpdate = 
  | MiniTheaterChannel["Client"]
  | LibraryChannel["Client"]
  | WikiDocChannel["Client"]


type AdvancedUpdates = AuthorizedConnection<{|
  server: LibraryServerUpdate,
  client: LibraryClientUpdate,
  query: { gameId: GameID }
|}>;

export type AdvancedUpdatesAPI = {|
  '/games/updates-advanced': AdvancedUpdates
|}
*/

const channels = [
  miniTheaterChannel,
  libraryChannel,
  wikiDocChannel
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