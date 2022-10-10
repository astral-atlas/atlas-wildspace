// @flow strict

import { createMaskForMonsterActor, getRoomResourcesAssetIds } from "@astral-atlas/wildspace-models";
import { createLibraryPageService } from "./page/libraryPage.js";
import { countRoomConnections } from "./room/connection.js";

/*::
import type { WildspaceData } from "../../data/entry";
import type { Identity } from "./auth";
import type { GameService } from "./game";
import type { GameID, GamePage, RoomID, RoomPage } from "@astral-atlas/wildspace-models";
import type { RoomService } from "./room";
import type { AssetService } from "./asset";
import type { LibraryPageService } from "./page/libraryPage";

export type PageService = {
  getGamePage: (gameId: GameID, identity: Identity, isGM: boolean) => Promise<?GamePage>,
  getRoomPage: (gameId: GameID, roomId: RoomID) => Promise<?RoomPage>,
  library: LibraryPageService,
};
*/

export const createPageService = (
  data/*: WildspaceData*/,
  gameService/*: GameService*/,
  roomService/*: RoomService*/,
  assetService/*: AssetService*/,
)/*: PageService*/ => {
  const getGamePage = async (gameId, identity, isGM) => {
    const [
      { result: game },
      players,
      { result: monsters },
      { result: characters },
      { result: monsterActors },
      { result: magicItems },
      { result: wikiDocs },
      { result: allRooms },
      roomConnections,
    ] = await Promise.all([
      data.game.get(gameId),
      gameService.listPlayers(gameId, identity),
      data.monsters.query(gameId),
      data.characters.query(gameId),
      data.gameData.monsterActors.query(gameId),
      data.gameData.magicItems.query(gameId),
      data.wiki.documents.query(gameId),
      data.roomData.rooms.query(gameId),
      roomService.connection.listAll(gameId),
    ]);
    if (!game)
      return null;


    const monsterMap = new Map(monsters.map(m => [m.id, m]));
    const monsterMasks = monsterActors.map(actor => {
      const monster = monsterMap.get(actor.monsterId);
      return monster && createMaskForMonsterActor(monster, actor);
    }).filter(Boolean);

    const assets = [
      ...(await Promise.all(characters
        .map(character => character.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => assetService.peek(assetId))
      )),
      ...(await Promise.all(monsters
        .map(monster => monster.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => assetService.peek(assetId))
      )),
    ].filter(Boolean);
    const rooms = allRooms.filter(r => !r.hidden || isGM);

    const gamePage = {
      game,

      players,
      characters,
      monsterMasks,

      magicItems,
      wikiDocs,

      rooms,
      roomConnectionCounts: countRoomConnections(roomConnections),

      assets,
    };
    return gamePage;
  };

  const getRoomPage = async (gameId, roomId) => {
    const [
      { result: room },
      state,
      connections,
    ] = await Promise.all([
      data.roomData.rooms.get(gameId, roomId),
      roomService.getState(gameId, roomId),
      roomService.connection.listRoom(gameId, roomId),
    ]);
    if (!room)
      return null;
    const resources = await roomService.getResources(gameId, roomId, state);
    const assetIds = getRoomResourcesAssetIds(resources, state);
    const assets = await assetService.batchPeek(assetIds);

    const roomPage = {
      room,
      state,
      resources,
      assets,
      version: state.version,
      connections: connections.map(c => ({ id: c.gameConnectionId, userId: c.userId })),
    };
    return roomPage;
  };
  const library = createLibraryPageService(data, assetService);

  return {
    getGamePage,
    getRoomPage,
    library,
  }
}