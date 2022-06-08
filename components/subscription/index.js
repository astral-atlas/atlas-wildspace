// @flow strict
/*:: import type { Ref, Component, Context } from '@lukekaalim/act'; */
import { useRef } from "@lukekaalim/act";
import { useMemo } from "@lukekaalim/act/hooks";

/*::
export type Subscriber<T> = T => mixed;
export type SubscriptionFunction<T> = (subscriber: Subscriber<T>) => () => void; 

export type SubscriptionValue<T> = [
  SubscriptionFunction<T>,
  Ref<Set<Subscriber<T>>>,
  T => mixed,
]
*/

export const useSubscriptionList = /*:: <T>*/()/*: SubscriptionValue<T>*/ => {
  const subscribersRef = useRef(new Set());
  const subscribe = useMemo(() => (listener) => {
    subscribersRef.current.add(listener);
    return () => {
      subscribersRef.current.delete(listener);
    }
  }, []);
  const invoke = (event) => {
    for (const subscriber of subscribersRef.current)
      subscriber(event)
  }
  return [subscribe, subscribersRef, invoke];
};
