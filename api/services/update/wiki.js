// @flow strict
/*::
import type { LinkGrant } from "@astral-atlas/sesame-models";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type {
  GameID, GameConnectionID,
  
  WikiDocID,
  WikiDocEvent,
  WikiDocAction, WikiDocFocusAction, WikiDocUpdate,
  WikiDocChannel
} from "@astral-atlas/wildspace-models";
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update.js";
*/
/*::
export type ServerWikiDocChannel = ServerUpdateChannel<WikiDocChannel>;

export type WikiService = {
  cleanupFocus: (gameId: GameID, wikiDocId: WikiDocID, now: number) => Promise<void>,
};
*/

import { applyWikiDocUpdate } from "@astral-atlas/wildspace-models";

export const createServerWikiDocChannel = (
  data/*: WildspaceData*/,
  { gameId, userId, connectionId, send }/*: ServerGameUpdateChannel*/
)/*: ServerWikiDocChannel*/ => {

  const subscriptions = new Map();
  const onSubscribe = async (wikiDocId) => {
    const onDocumentEvent = (wikiDocEvent) => {
      send({ type: 'wikidoc-event', wikiDocId, wikiDocEvent })
    }
    subscriptions.set(wikiDocId, data.wiki.documentEvents.subscribe(wikiDocId, onDocumentEvent));
    const documentConnection = { gameConnectionId: connectionId, userId }
    await data.wiki.documentConnections.set(wikiDocId, connectionId, documentConnection);
  }
  const onUnsubscribe = async (wikiDocId) => {
    const subscription = subscriptions.get(wikiDocId);
    if (!subscription)
      throw new Error();

    subscriptions.delete(wikiDocId);
    subscription.unsubscribe();
    await data.wiki.documentConnections.set(wikiDocId, connectionId, null);
  }

  const onFocus = async (wikiDocId, selection) => {
    const focus = { connectionId, selection, userId }
    await data.wiki.documentFocus.set(wikiDocId, connectionId, focus);
    data.wiki.documentEvents.publish(wikiDocId, { type: 'focus', docId: wikiDocId, focus });
  }
  const onUpdate = async (wikiDocId, clientId, steps, version) => {
    const update = { version, steps, userId, clientId };
    try {
      await data.wiki.documents.transaction(gameId, wikiDocId, wikiDoc => applyWikiDocUpdate(wikiDoc, update), 4);
      data.wiki.documentEvents.publish(wikiDocId, { type: 'update', docId: wikiDocId, update });
    } catch (error) {
      // this is expected
    }
  }

  const onAction = (wikiDocId, action) => {
    switch (action.type) {
      case 'focus':
        return onFocus(wikiDocId, action.focus)
      case 'update':
        return onUpdate(wikiDocId, action.clientId, action.steps, action.version)
    }
  }

  const update = (message) => {
    switch (message.type) {
      case 'wikidoc-subscribe':
        return void onSubscribe(message.wikiDocId)
      case 'wikidoc-unsubscribe':
        return void onUnsubscribe(message.wikiDocId)
      case 'wikidoc-action':
        return void onAction(message.wikiDocId, message.wikiDocAction);
    }
  };
  const close = async () => {
    for (const [wikiDocId, wikiDocSubscription] of subscriptions) {
      wikiDocSubscription.unsubscribe();
      await data.wiki.documentConnections.set(wikiDocId, connectionId, null);
    }
    subscriptions.clear();
  };
  return { update, close };
}