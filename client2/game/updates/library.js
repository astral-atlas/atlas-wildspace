// @flow strict
/*::
import type { WSServiceClient } from "../../wildspace";
import type { GameUpdatesConnection } from "../updates";
import type {
  GameID,
  LibraryData
} from "@astral-atlas/wildspace-models";
*/
/*::

export type LibaryConnectionClient = {
  upgrade: (updateConnection: GameUpdatesConnection) => LibaryConnection,
};
export type LibaryConnection = {
  subscribeLibrary: (subscriber: (data: LibraryData) => mixed) => () => void,

  close: () => void,
};
*/

const publish = /*:: <T>*/(event/*: T*/, subscribers/*: Iterable<T => mixed>*/) => {
  for (const subscriber of subscribers)
    subscriber(event);
}

export const createLibraryConnectionClient = (
  
)/*: LibaryConnectionClient*/ => {
  const upgrade = (updateConnection) => {
    let isLoaded = false;
    let libraryData/*: LibraryData*/ = {
      characters: [],
      monsters: [],
      monsterActors: [],
      miniTheaters: [],
      characterPieces: [],
      monsterPieces: [],
    };

    const librarySubscribers = new Set();
    const updateLibraryData = (nextData) => {
      libraryData = { ...libraryData, ...nextData }
      publish(libraryData, librarySubscribers);
    }
    const subscribeLibrary = (subscriber) => {
      librarySubscribers.add(subscriber);
      return () => {
        librarySubscribers.delete(subscriber)
      }
    }

    const unsubscribe = updateConnection.subscribeLibrary(event => {
      switch (event.type) {
        case 'load':
          isLoaded = true;
          return updateLibraryData(event.library);
        case "mini-theaters":
          return updateLibraryData({
            characterPieces: event.characterPieces,
            miniTheaters: event.miniTheaters,
            monsterPieces: event.monsterPieces
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