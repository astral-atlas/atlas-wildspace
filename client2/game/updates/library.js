// @flow strict
/*::
import type { HTTPServiceClient, WSServiceClient } from "../../wildspace";
import type { LibraryClient } from "../library";
import type { GameUpdatesConnection } from "../updates";
import type {
  GameID,
  LibraryData
} from "@astral-atlas/wildspace-models";
*/
/*::

export type LibraryConnectionClient = {
  upgrade: (updateConnection: GameUpdatesConnection) => Promise<LibraryConnection>,
};
export type LibraryConnection = {
  subscribeLibrary: (subscriber: (data: LibraryData) => mixed) => () => void,

  close: () => void,
};
*/

const publish = /*:: <T>*/(event/*: T*/, subscribers/*: Iterable<T => mixed>*/) => {
  for (const subscriber of subscribers)
    subscriber(event);
}

export const createLibraryConnectionClient = (
  library/*: LibraryClient*/
)/*: LibraryConnectionClient*/ => {
  const upgrade = async (updateConnection) => {
    let libraryData/*: LibraryData*/ = await library.get(updateConnection.gameId);

    const librarySubscribers = new Set();
    const updateLibraryData = (nextData) => {
      libraryData = { ...libraryData, ...nextData }
      publish(libraryData, librarySubscribers);
    }
    const subscribeLibrary = (subscriber) => {
      librarySubscribers.add(subscriber);
      if (librarySubscribers.size === 1)
        updateConnection.send({ type: 'library-subscribe' })

      subscriber(libraryData);
      
      return () => {
        librarySubscribers.delete(subscriber)
      }
    }

    const unsubscribe = updateConnection.subscribeLibrary(event => {
      switch (event.type) {
        case "mini-theaters":
          return updateLibraryData({
            miniTheaters: event.miniTheaters,
          });
        case 'characters':
          return updateLibraryData({
            characters: event.characters
          });
        case 'monsters':
          return updateLibraryData({
            monsters: event.monsters
          });
        case 'monster-actors':
          return updateLibraryData({
            monsterActors: event.monsterActors
          });
        case 'scenes':
          return updateLibraryData({
            scenes: event.scenes
          });
        case 'expositions':
          return updateLibraryData({
            expositions: event.expositions
          });
        case 'locations':
          return updateLibraryData({
            locations: event.locations
          });
        default:
          return;
      }
    });

    const close = () => {
      unsubscribe();
      librarySubscribers.clear();
    }

    return { subscribeLibrary, close }
  }

  return { upgrade };
}