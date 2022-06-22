// @flow strict

/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { ServerMiniTheaterChannel } from "./update/miniTheater";
import type { ServerWikiDocChannel } from "./update/wiki";
import type { ServerLibraryChannel } from "./update/library";
import type { ServerGamePageChannel } from "./update/gamePage";
import type { ServerRoomPageChannel } from "./update/roomPage";

import type { RoomService } from "./room";
import type { GameService } from "./game";
import type { UserID } from "@astral-atlas/sesame-models";
import type {
  Game,
  GameID, GameConnectionID,
  UpdateChannelServerMessage,
  UpdateChannelClientMessage
} from "@astral-atlas/wildspace-models";
import type { AssetService } from "./asset";
import type { Identity } from "./auth";
*/

import { createServerMiniTheaterChannel } from "./update/miniTheater.js";
import { createServerWikiDocChannel } from "./update/wiki.js";
import { createServerLibraryChannel } from "./update/library.js";
import { createServerRoomPageChannel } from "./update/roomPage.js";
import { createServerGamePageChannel } from "./update/gamePage.js";

/*::
export type UpdateService = {
  create: (game: Game, userId: UserID, connectionId: GameConnectionID, send: UpdateChannelServerMessage => void, identity: Identity) => {
    game: ServerGameUpdateChannel,
    miniTheater: ServerMiniTheaterChannel,
    wikiDoc: ServerWikiDocChannel,
    library: ServerLibraryChannel,
    roomPage: ServerRoomPageChannel,
    gamePage: ServerGamePageChannel,

    update: UpdateChannelClientMessage => void,
    close: () => Promise<void>,
  }
};

export type ServerGameUpdateChannel = {
  game: Game,
  userId: UserID,
  identity: Identity,
  connectionId: GameConnectionID,

  send: (message: UpdateChannelServerMessage) => void,
};
*/

export const createUpdateService = (
  data/*: WildspaceData*/,
  roomService/*: RoomService*/,
  gameService/*: GameService*/,
  asset/*: AssetService*/,
)/*: UpdateService*/ => {

  const create = (game, userId, connectionId, send, identity) => {
    const gameUpdateChannel = { game, userId, connectionId, send, identity }
    const miniTheater = createServerMiniTheaterChannel(data, gameUpdateChannel);
    const wikiDoc = createServerWikiDocChannel(data, gameUpdateChannel);
    const library = createServerLibraryChannel(data, asset, gameUpdateChannel);
    const roomPage = createServerRoomPageChannel(data, roomService, gameUpdateChannel);
    const gamePage = createServerGamePageChannel(data, gameService, gameUpdateChannel);

    const close = async () => {
      await Promise.all([
        miniTheater.close(),
        wikiDoc.close(),
        library.close(),
        roomPage.close(),
        gamePage.close()
      ]);
    };

    const update = (message) => {
      miniTheater.update(message);
      wikiDoc.update(message);
      library.update(message);
      roomPage.update(message);
      gamePage.update(message);
    }

    return {
      close,
      update,
      game: gameUpdateChannel,
      miniTheater,
      wikiDoc,
      library,
      roomPage,
      gamePage,
    }
  };

  return {
    create,
  }
}