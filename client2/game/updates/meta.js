// @flow strict
/*::
import type { GameUpdatesConnection } from "../updates";
import type {
  AdvancedUpdateChannelDescription,
  UpdateChannelServerMessage,
  UpdateChannelClientMessage,
  GameID,
} from "@astral-atlas/wildspace-models";
*/

/*::
export type GameUpdateChannel<TID, TResource> = {
  subscribe: (id: TID, subscriber: (resource: TResource) => mixed) => () => void,
  close: () => void,
};
*/

export const createUpdateChannel = /*:: <TDesc: any, TID>*/(
  description/*: AdvancedUpdateChannelDescription<TDesc>*/,
  implementation/*: {
    getInitialResource: (gameId: GameID, resourceId: TID) => TDesc["Resource"] | Promise<TDesc["Resource"]>,
    createSubscribeEvent: (resourceId: TID, allSubscriptions: Set<TID>) => UpdateChannelClientMessage,
    createUnsubscribeEvent: (resourceId: TID, allSubscriptions: Set<TID>) => UpdateChannelClientMessage,
    getChannelMessage: (event: UpdateChannelServerMessage) => ?TDesc["Server"],
    getIds: (event: TDesc["Server"]) => TID[],
  }*/,
  updates/*: GameUpdatesConnection*/,
)/*: GameUpdateChannel<TID, TDesc["Resource"]>*/ => {
  const resources/*: Map<TID, Promise<TDesc["Resource"]>>*/ = new Map()
  const subscribers/*: Map<TID, Set<TDesc["Resource"] => mixed>>*/ = new Map()

  const onNewResourceSubscription = async (resourceId) => {
    const resourcePromise = implementation.getInitialResource(updates.gameId, resourceId);
    resources.set(resourceId, Promise.resolve(resourcePromise));
    updates.send(implementation.createSubscribeEvent(resourceId, new Set(resources.keys())))
    
    return resourcePromise;
  }
  const onCancelResourceSubscription = (resourceId) => {
    resources.delete(resourceId);
    subscribers.delete(resourceId);
    updates.send(implementation.createSubscribeEvent(resourceId, new Set(resources.keys())))
  }
  const onUpdateResource = async (id, message) => {
    const resourcePromise = resources.get(id)
    if (!resourcePromise)
      return null;
    const prevResource = await resourcePromise;
    const nextResource = description.reduceResource(prevResource, message)
    for (const subscriber of subscribers.get(id) || [])
      subscriber(nextResource);

    resources.set(id, Promise.resolve(nextResource));
  }
  const onUpdate = async (event) => {
    const message = implementation.getChannelMessage(event);
    if (!message)
      return;
    const ids = implementation.getIds(message);
    for (const id of ids)
      onUpdateResource(id, message)
  }

  const unsubscribe = updates.subscribe(onUpdate);

  const subscribe = (id, subscriber) => {
    const resource = resources.get(id) || onNewResourceSubscription(id);
    resource.then(subscriber);
    
    const subscribersForId = subscribers.get(id) || new Set();
    subscribersForId.add(subscriber);
    subscribers.set(id, subscribersForId);
    return () => {
      subscribersForId.delete(subscriber);
      if (subscribersForId.size === 0)
        onCancelResourceSubscription(id)
    };
  };

  const close = () => {
    unsubscribe()
  }

  return { subscribe, close };
};