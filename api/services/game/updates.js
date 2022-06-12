// @flow strict

/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { ServerMiniTheaterChannel } from "./updateChannels/miniTheater";
import type { ServerWikiDocChannel } from "./updateChannels/wiki";
import type { ServerLibraryChannel } from "./updateChannels/library";
import type { UserID } from "@astral-atlas/sesame-models";
import type {
  GameID, GameConnectionID,
  UpdateChannelServerMessage,
  UpdateChannelClientMessage
} from "@astral-atlas/wildspace-models";
*/

import { createServerMiniTheaterChannel } from "./updateChannels/miniTheater.js";
import { createServerWikiDocChannel } from "./updateChannels/wiki.js";
import { createServerLibraryChannel } from "./updateChannels/library.js";

/*::
export type GameUpdateService = {
  create: (gameId: GameID, userId: UserID, connectionId: GameConnectionID, send: UpdateChannelServerMessage => void) => {
    game: ServerGameUpdateChannel,
    miniTheater: ServerMiniTheaterChannel,
    wikiDoc: ServerWikiDocChannel,
    library: ServerLibraryChannel,

    update: UpdateChannelClientMessage => void,
    close: () => Promise<void>,
  }
};

export type ServerGameUpdateChannel = {
  gameId: GameID,
  userId: UserID,
  connectionId: GameConnectionID,

  send: (message: UpdateChannelServerMessage) => void,
};
*/

export const createGameUpdateService = (data/*: WildspaceData*/)/*: GameUpdateService*/ => {

  const create = (gameId, userId, connectionId, send) => {
    const game = { gameId, userId, connectionId, send }
    const miniTheater = createServerMiniTheaterChannel(data, game);
    const wikiDoc = createServerWikiDocChannel(data, game);
    const library = createServerLibraryChannel(data, game);

    const close = async () => {
      await Promise.all([
        miniTheater.close(),
        wikiDoc.close(),
        library.close(),
      ]);
    };

    const update = (message) => {
      miniTheater.update(message);
      wikiDoc.update(message);
      library.update(message);
    }

    return {
      close,
      update,
      game,
      miniTheater,
      wikiDoc,
      library,
    }
  };

  return {
    create,
  }
}