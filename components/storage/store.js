// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
*/

/*::
export type Store<T> = {
  get: () => T,
  set: (value: T) => void,

  subscribe: (subscriber: ((nextItem: T) => mixed)) => () => void,
};
*/

export const createStorageStore = /*:: <T>*/(
  uniqueKey/*: string*/,
  castValue/*: Cast<T>*/,
  defaultValue/*: T*/,
  storage/*: Storage*/ = window.localStorage,
)/*: Store<T>*/ => {
  
  const get = () => {
    const storedItem = storage.getItem(uniqueKey);
    if (!storedItem)
      return defaultValue;
    const parsedItem = castValue(JSON.parse(storedItem));
    return parsedItem;
  };
  const set = (nextItem) => {
    storage.setItem(uniqueKey, JSON.stringify(nextItem));
    for (const subscriber of subscribers.values())
      subscriber(nextItem);
  };

  const subscribers = new Map();
  const subscribe = (subscriber) => {
    const id = Symbol();
    subscribers.set(id, subscriber);
    return () => {
      subscribers.delete(id);
    }
  };

  return {
    get,
    set,
    subscribe,
  };
}