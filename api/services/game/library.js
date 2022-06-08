// @flow strict
/*::
import type {  } from "../../../models/game/library";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, LibraryEvent } from "@astral-atlas/wildspace-models";

export type LibaryConnection = {
  start: (onLibraryEvent: (event: LibraryEvent) => mixed) => void,
  close: () => void,
};

export type LibraryConnectionService = {
  create: (gameId: GameID) => LibaryConnection
};
*/

export const createLibraryConnectionService = (data/*: WildspaceData*/)/*: LibraryConnectionService*/ => {
  const create = (gameId) => {
    let subscription = null;
    const start = (onLibraryEvent) => {
      if (subscription)
        subscription.unsubscribe()

      const onGameUpdate = async (update) => {
        switch (update.type) {
          case 'monsterActors':
            const { result: monsterActors } = await data.gameData.monsterActors.query(gameId);
            return onLibraryEvent({ type: 'monster-actors', monsterActors })
          case 'monsters':
            const { result: monsters } = await data.monsters.query(gameId);
            return onLibraryEvent({ type: 'monsters', monsters })
          case 'mini-theater':
            const { result: miniTheaters } = await data.gameData.miniTheaters.query(gameId);
            return onLibraryEvent({ type: 'mini-theaters', miniTheaters })
          case 'scenes':
            const { result: scenes } = await data.gameData.scenes.query(gameId);
            return onLibraryEvent({ type: 'scenes', scenes })
          case 'locations':
            const { result: locations } = await data.gameData.locations.query(gameId);
            return onLibraryEvent({ type: 'locations', locations })
          case 'exposition':
            const { result: expositions } = await data.gameData.expositions.query(gameId);
            return onLibraryEvent({ type: 'expositions', expositions })
        }
      }

      subscription = data.gameUpdates.subscribe(gameId, onGameUpdate)
    }
    const close = () => {
      if (subscription)
        subscription.unsubscribe()
    }

    return {
      start,
      close,
    }
  }

  return {
    create
  }
};
