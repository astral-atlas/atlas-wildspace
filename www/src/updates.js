// @flow strict
/*::
import type { GameID, GamePage, RoomID, RoomPage, LibraryData } from "@astral-atlas/wildspace-models";
import type { UpdatesConnection, WildspaceClient } from "@astral-atlas/wildspace-client2";
*/

import { useEffect, useState } from "@lukekaalim/act";

export const useUpdates = (client/*: WildspaceClient*/, gameId/*: ?GameID*/)/*: ?UpdatesConnection*/ => {
  const [updates, setUpdates] = useState(null)
  
  useEffect(() => {
    if (!gameId)
      return;
    const updatePromise = client.updates.create(gameId);
    updatePromise.then(setUpdates)
    return () => {
      updatePromise.then(updates => updates.updates.close());
    }
  }, [client, gameId])

  return updates;
}

export const useGamePage = (updates/*: ?UpdatesConnection*/)/*: ?GamePage*/ => {
  const [gamePage, setGamePage] = useState(null);

  useEffect(() =>
    updates &&
    updates.gamePage.subscribe(setGamePage),
    [updates])

  return gamePage;
}

export const useRoomPage = (roomId/*: ?RoomID*/, updates/*: ?UpdatesConnection*/)/*: ?RoomPage*/ => {
  const [roomPage, setRoomPage] = useState(null);
  useEffect(() =>
    updates && roomId &&
    updates.roomPage.subscribe(roomId, setRoomPage) || null,
    [roomId, updates])
  return roomPage;
}

export const useLibraryData = (updates/*: ?UpdatesConnection*/)/*: ?LibraryData*/ => {
  const [libraryData, setLibraryData] = useState(null);
  useEffect(() =>
    updates &&
    updates.library.subscribe(setLibraryData),
    [updates])
  return libraryData;
}