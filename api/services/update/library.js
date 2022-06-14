// @flow strict
/*::
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, LibraryEvent, LibraryChannel } from "@astral-atlas/wildspace-models";

export type ServerLibraryChannel = ServerUpdateChannel<LibraryChannel>;

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


export const createServerLibraryChannel = (data/*: WildspaceData*/, { gameId, send }/*: ServerGameUpdateChannel*/)/*: ServerLibraryChannel*/ => {
  let subscription = null;

  const createLibraryEvent = async (update) => {
    switch (update.type) {
      case 'monsterActors':
        const { result: monsterActors } = await data.gameData.monsterActors.query(gameId);
        return { type: 'monster-actors', monsterActors }
      case 'monsters':
        const { result: monsters } = await data.monsters.query(gameId);
        return { type: 'monsters', monsters }
      case 'mini-theater':
        const { result: miniTheaters } = await data.gameData.miniTheaters.query(gameId);
        return { type: 'mini-theaters', miniTheaters }
      case 'scenes':
        const { result: scenes } = await data.gameData.scenes.query(gameId);
        return { type: 'scenes', scenes }
      case 'locations':
        const { result: locations } = await data.gameData.locations.query(gameId);
        return { type: 'locations', locations }
      case 'exposition':
        const { result: expositions } = await data.gameData.expositions.query(gameId);
        return { type: 'expositions', expositions };
      default:
        throw new Error();
    }
  }

  const onGameUpdate = async (update) => {
    send({ type: 'library-event', event: await createLibraryEvent(update) })
  }

  const onSubscribe = () => {
    subscription = data.gameUpdates.subscribe(gameId, onGameUpdate)
  };
  const onUnsubscribe = () => {
    subscription?.unsubscribe();
  }

  const update = (event) => {
    switch (event.type) {
      case 'library-subscribe':
        return onSubscribe()
      case 'library-unsubscribe':
        return onUnsubscribe();
    }
  };
  const close = async () => {
    onUnsubscribe();
  }
  return { update, close };
}