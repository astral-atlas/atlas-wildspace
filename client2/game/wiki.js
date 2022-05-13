// @flow strict
/*::
import type {
  CRUDGameAPI,
  DeriveGameCRUDDescription,
} from "@astral-atlas/wildspace-models";
import type { WikiAPI } from "../../models/api/game/wiki";
import type { GameCRUDClient } from "./meta";
import type { UserID } from "@astral-atlas/sesame-models";
import type { WikiDocID, WikiDoc, WikiDocEvent, WikiDocAction, WikiDocFocus, WikiDocUpdate } from "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";
*/
import { createGameCRUDClient } from "./meta";

/*::

export type WikiConnectionManager = {
  recieve: WikiDocEvent => void,
  client: WikiConnectionClient,
};
export type WikiConnection = {
  addLoadListener: (WikiDoc => mixed) => () => void, 

  addUpdateListener: (WikiDocUpdate => mixed) => () => void, 
  update: (steps: mixed[], clientId: number, version: number) => void,

  focus: (from: number, to: number) => void,
  addFocusListener: ($ReadOnlyArray<WikiDocFocus> => mixed) => () => void, 

  disconnect: () => void,
  //addDisconnectListener: () => () => void, 
}
export type WikiConnectionClient = {
  connect: (docId: WikiDocID) => WikiConnection
};
*/

import { wikiAPI } from "@astral-atlas/wildspace-models";

export const createWikiConnectionManager = (
  send/*: WikiDocAction => mixed*/,
)/*: WikiConnectionManager*/ => {
  const docConnections = new Map/*:: <WikiDocID, {
    subscribers: Set<WikiDocUpdate => mixed>,
    loadSubscribers: Set<WikiDoc => mixed>,
    focusSubscribers: Set<$ReadOnlyArray<WikiDocFocus> => mixed>,
    focus: $ReadOnlyArray<WikiDocFocus>,
    doc: ?WikiDoc,
  }>*/();

  const recieve = (event) => {
    switch (event.type) {
      case 'focus': {
        const docConnection = docConnections.get(event.docId);
        if (!docConnection)
          return;
        const nextFocus = [...new Map([...docConnection.focus.map(f => [f.connectionId, f]), [event.focus.connectionId, event.focus]]).values()];
        docConnections.set(event.docId, { ...docConnection, focus: nextFocus });
        for (const subscriber of docConnection.focusSubscribers)
          subscriber(nextFocus);
        return;
      }
      case 'update': {
        const docConnection = docConnections.get(event.docId);
        if (!docConnection)
          return;

          for (const subscriber of docConnection.subscribers)
            subscriber(event.update);
          return;
      }
      case 'load': {
        const docConnection = docConnections.get(event.doc.id);
        if (!docConnection)
          return;

        docConnections.set(event.doc.id, { ...docConnection, doc: event.doc, focus: event.focus });
        for (const subscriber of docConnection.loadSubscribers)
          subscriber(event.doc);
        for (const subscriber of docConnection.focusSubscribers)
          subscriber(event.focus);
        return;
      }
    }
  };

  const connect = (docId) => {
    const docConnection = docConnections.get(docId) || { doc: null, focus: [], loadSubscribers: new Set(), subscribers: new Set(), focusSubscribers: new Set() };

    if (!docConnections.has(docId)) {
      docConnections.set(docId, docConnection);
      send({ type: 'open', docId });
    }
    //docConnection.loadSubscribers.add(onDocLoad);
    //docConnection.focusSubscribers.add(onFocusUpdate);

    const update = (steps, clientId, version) => {
      send({ type: 'update', docId, version, steps, clientId })
    };
    const focus = (from, to) => {
      send({ type: 'focus', docId, focus: { from, to }})
    };
    const disconnect = () => {
      for (const onUpdate of updateListeners)
        docConnection.subscribers.delete(onUpdate);
      for (const onFocus of focusListeners)
        docConnection.focusSubscribers.delete(onFocus);
      for (const onLoad of loadListeners)
        docConnection.loadSubscribers.delete(onLoad);

      if (docConnection.subscribers.size === 0) {
        send({ type: 'close', docId });
        docConnections.delete(docId);
      }
    }

    const focusListeners = new Set();
    const updateListeners = new Set();
    const loadListeners = new Set();
    const unloadListeners = new Set();

    const addUpdateListener = (onUpdate) => {
      updateListeners.add(onUpdate);
      docConnection.subscribers.add(onUpdate);
      return () => {
        updateListeners.delete(onUpdate);
        docConnection.subscribers.delete(onUpdate);
      }
    };
    const addFocusListener = (onFocus) => {
      focusListeners.add(onFocus);
      docConnection.focusSubscribers.add(onFocus);
      return () => {
        focusListeners.delete(onFocus);
        docConnection.focusSubscribers.delete(onFocus);
      }
    };
    const addLoadListener = (onLoad) => {
      loadListeners.add(onLoad);
      docConnection.loadSubscribers.add(onLoad);
      return () => {
        loadListeners.delete(onLoad);
        docConnection.loadSubscribers.delete(onLoad);
      }
    };

    const connection = {
      addUpdateListener,
      addFocusListener,
      addLoadListener,
      update,
      focus,
      disconnect,
    }
    return connection;
  };
  
  const client = {
    connect,
  };

  return { client, recieve };
};

/*::
export type WikidocClient = {
  ...GameCRUDClient<DeriveGameCRUDDescription<WikiAPI["/game/wiki"]>>,
}
*/

export const createWikidocClient= (http/*: HTTPServiceClient*/)/*: WikidocClient*/  => {
  return createGameCRUDClient(http, wikiAPI["/game/wiki"], { idName: 'wikiDocId', name: 'wikiDoc' });
}
