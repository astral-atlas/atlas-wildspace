// @flow strict

/*::
export type Channel<K, V> = {
  subscribe: (key: K, onEvent: (value: V) => mixed) => { unsubscribe: () => void };
  publish: (key: K, value: V) => void, 
};
*/

export const createMemoryChannel = /*:: <K, V>*/()/*: Channel<K, V>*/ => {
  let subscribers = []

  const subscribe = (key, listener) => {
    const subscription = { key, listener };
    subscribers.push(subscription);
    return {
      unsubscribe() {
        subscribers = subscribers.filter(s => s !== subscription)
      }
    }
  };
  const publish = (key, value) => {
    for (const { listener } of subscribers.filter(s => s.key !== key))
      try {
        listener(value);
      } catch (error) { console.warn(error); }
  };

  return {
    subscribe,
    publish
  }
};