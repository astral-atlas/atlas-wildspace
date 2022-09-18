// @flow strict
/*::
import type { HTTPServiceClient, WSServiceClient } from "../wildspace";
import type { LibraryClient } from "../game/library";
import type { GameUpdatesConnection } from "../updates";
import type {
  GameID,
  LibraryData
} from "@astral-atlas/wildspace-models";
*/
/*::
export type LibraryConnection = {
  subscribe: (subscriber: (data: LibraryData) => mixed) => () => void,

  close: () => void,
};
*/

import { reduceLibraryEvent } from "@astral-atlas/wildspace-models";


export const createLibraryConnection = (
  library/*: LibraryClient*/,
  updates/*: GameUpdatesConnection*/,
)/*: LibraryConnection*/ => {
  let libraryDataPromise/*: ?Promise<LibraryData>*/ = null;

  const librarySubscribers = new Set();
  const onUpdate = async (event) => {
    console.log(event, libraryDataPromise)
    if (event.type !== 'library-event')
      return
    if (!libraryDataPromise)
      return;
    const prev = await libraryDataPromise;
    const next = reduceLibraryEvent(prev, event.event)
    libraryDataPromise = Promise.resolve(next);
    for (const subscriber of librarySubscribers)
      subscriber(next)
  }
  const unsubscribe = updates.subscribe(onUpdate)

  const onFirstSubscribe = async () => {
    const promise = library.get(updates.gameId);
    updates.send({ type: 'library-subscribe' })
    libraryDataPromise = promise;
    console.log('Setting Promise')
    return promise;
  }
  const onLastUnsubscriber = () => {
    updates.send({ type: 'library-unsubscribe' })
  }

  const subscribe = (subscriber) => {
    librarySubscribers.add(subscriber);
    (libraryDataPromise || onFirstSubscribe())
      .then(subscriber)
    
    return () => {
      librarySubscribers.delete(subscriber)
      if (librarySubscribers.size === 0)
        onLastUnsubscriber()
    }
  }

  const close = () => {
    unsubscribe();
    librarySubscribers.clear();
  }

  return { subscribe, close }
}