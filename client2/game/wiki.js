// @flow strict
/*::
import type {
  CRUDGameAPI,
  DeriveGameCRUDDescription,
  GameConnectionID,
  WikiDocConnection,
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

  addConnectionsListener: (Map<GameConnectionID, WikiDocConnection> => mixed) => () => void, 
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
    connectionSubscribers: Set<Map<GameConnectionID, WikiDocConnection> => mixed>,
    focus: $ReadOnlyArray<WikiDocFocus>,
    connections: Map<GameConnectionID, WikiDocConnection>,
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
      case 'connect': {
        const docConnection = docConnections.get(event.docId);
        if (!docConnection)
          return;
        const nextConnections = new Map([...docConnection.connections, [event.connection.gameConnectionId, event.connection]]);
        docConnections.set(event.docId, {
          ...docConnection,
          connections: nextConnections
        });
        for (const subscriber of docConnection.connectionSubscribers)
          subscriber(nextConnections);
        return;
      }
      case 'disconnect': {
        const docConnection = docConnections.get(event.docId);
        if (!docConnection)
          return;
        const nextFocus = docConnection.focus.filter(f => f.connectionId != event.connectionId);
        const nextConnections = new Map([...docConnection.connections].filter(([id, c]) => id !== event.connectionId));
        docConnections.set(event.docId, {
          ...docConnection,
          focus: nextFocus,
          connections: nextConnections
        });
        for (const subscriber of docConnection.focusSubscribers)
          subscriber(nextFocus);
        for (const subscriber of docConnection.connectionSubscribers)
          subscriber(nextConnections);
        return;
      }
      case 'load': {
        const docConnection = docConnections.get(event.doc.id);
        if (!docConnection)
          return;

        const nextConnections = new Map(event.connections.map(c => [c.gameConnectionId, c]));
        docConnections.set(event.doc.id, {
          ...docConnection,
          doc: event.doc,
          focus: event.focus,
          connections: nextConnections,
        });
        for (const subscriber of docConnection.loadSubscribers)
          subscriber(event.doc);
        for (const subscriber of docConnection.focusSubscribers)
          subscriber(event.focus);
        for (const subscriber of docConnection.connectionSubscribers)
          subscriber(nextConnections);
        return;
      }
    }
  };

  const connect = (docId) => {
    const docConnection = docConnections.get(docId) || {
      doc: null, focus: [], connections: new Map(),
      loadSubscribers: new Set(),
      subscribers: new Set(),
      focusSubscribers: new Set(),
      connectionSubscribers: new Set()
    };

    if (!docConnections.has(docId)) {
      docConnections.set(docId, docConnection);
      send({ type: 'open', docId });
    }

    const pendingUpdates = [];
    const updateInterval = setInterval(() => {
      const updates = [...pendingUpdates]
      
      pendingUpdates.length = 0;
      for (const update of updates)
        send(update)
      
      if (pendingFocus) {
        send(pendingFocus);
        pendingFocus = null;
      }
    }, 200);

    const update = (steps, clientId, version) => {
      const prevUpdate = pendingUpdates[pendingUpdates.length - 1];
      const nextUpdate = { type: 'update', docId, version, steps, clientId };
      if (prevUpdate && prevUpdate.version === version)
        pendingUpdates[pendingUpdates.length - 1] = nextUpdate;
      else
        pendingUpdates.push(nextUpdate);
    };
    let pendingFocus = null
    const focus = (from, to) => {
      pendingFocus = { type: 'focus', docId, focus: { from, to }}
    };
    const disconnect = () => {
      for (const onUpdate of updateListeners)
        docConnection.subscribers.delete(onUpdate);
      for (const onFocus of focusListeners)
        docConnection.focusSubscribers.delete(onFocus);
      for (const onLoad of loadListeners)
        docConnection.loadSubscribers.delete(onLoad);

      clearInterval(updateInterval);

      if (docConnection.subscribers.size === 0) {
        send({ type: 'close', docId });
        docConnections.delete(docId);
      }
    }

    const focusListeners = new Set();
    const connectionListeners = new Set();
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
    const addConnectionsListener = (onConnectionChange) => {
      connectionListeners.add(onConnectionChange);
      docConnection.connectionSubscribers.add(onConnectionChange);
      return () => {
        connectionListeners.delete(onConnectionChange);
        docConnection.connectionSubscribers.delete(onConnectionChange);
      }
    }

    const connection = {
      addUpdateListener,
      addFocusListener,
      addLoadListener,
      addConnectionsListener,
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
