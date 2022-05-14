// @flow strict
/*::
import type { LinkGrant } from "@astral-atlas/sesame-models";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type {
  GameID, GameConnectionID,
  
  WikiDocID,
  WikiDocEvent,
  WikiDocAction, WikiDocFocusAction, WikiDocUpdate
} from "@astral-atlas/wildspace-models";
import type { GameConnectionService } from './connection.js';
*/
/*::
export type WikiServiceClient = {
  disconnect: () => Promise<void>,

  handleAction: (action: WikiDocAction) => Promise<void>,
}

export type WikiService = {
  connectClient: (gameId: GameID, connectionId: GameConnectionID, linkGrant: LinkGrant, onWikiEvent: WikiDocEvent => mixed) => WikiServiceClient,
  cleanupFocus: (gameId: GameID, wikiDocId: WikiDocID, now: number) => Promise<void>,
};
*/

import { applyWikiDocUpdate } from "@astral-atlas/wildspace-models";

export const createWikiService = (data/*: WildspaceData*/, connection/*: GameConnectionService*/)/*: WikiService*/ => {
  const cleanupFocus = async (gameId, wikiDocId, now) => {
    const connections = await connection.getValidConnections(gameId, now);
    const { result: focuses } = await data.wiki.documentFocus.query(wikiDocId);
    await Promise.all(focuses
      .filter(f => !connections.find(c => c.id === f.connectionId))
      .map(f => data.wiki.documentFocus.set(wikiDocId, f.connectionId, null))
    )
  }
  const cleanupConnection = async (gameId, wikiDocId, now) => {
    const connections = await connection.getValidConnections(gameId, now);
    const { result: docConnections } = await data.wiki.documentConnections.query(wikiDocId);
    await Promise.all(docConnections
      .filter(d => !connections.find(c => c.id === d.gameConnectionId))
      .map(d => data.wiki.documentConnections.set(wikiDocId, d.gameConnectionId, null))
    )
  }
  const cleanupDoc = async (gameId, wikiDocId, now) => {
    await Promise.all([
      cleanupFocus(gameId, wikiDocId, now),
      cleanupConnection(gameId, wikiDocId, now)
    ])
  }

  const connectClient = (gameId, connectionId, linkGrant, onWikiEvent) => {
    const docStates = new Map/*:: <WikiDocID, { unsubscribe: () => mixed }>*/();

    const openDoc = async (docId) => {
      await cleanupDoc(gameId, docId, Date.now());

      const { result: doc } = await data.wiki.documents.get(gameId, docId);
      if (!doc)
        return;

      if (!docStates.has(doc.id)) {
        const { unsubscribe } = data.wiki.documentEvents.subscribe(doc.id, onWikiEvent)
        docStates.set(doc.id, { unsubscribe });
      }
      const { result: focus } = await data.wiki.documentFocus.query(docId);
      const connection = { userId: linkGrant.identity, gameConnectionId: connectionId };
      await data.wiki.documentConnections.set(docId, connectionId, connection);
      const { result: connections } = await data.wiki.documentConnections.query(docId)
      data.wiki.documentEvents.publish(docId, { type: 'connect', docId, connection });
      
      onWikiEvent({ type: 'load', focus, doc, connections })
    };
    const closeDoc = async (docId) => {
      const docState = docStates.get(docId);
      if (!docState)
        return;
      data.wiki.documentEvents.publish(docId, { type: 'disconnect', docId, connectionId });
      docStates.delete(docId);
      docState.unsubscribe();
      await Promise.all([
        data.wiki.documentFocus.set(docId, connectionId, null),
        data.wiki.documentConnections.set(docId, connectionId, null),
      ]);
    };


    const update = async (docId, version, steps, clientId) => {
      const { result: doc } = await data.wiki.documents.get(gameId, docId);
      if (!doc)
        return;
      const update = { version, steps, userId: linkGrant.identity, clientId };
      try {
        await data.wiki.documents.transaction(gameId, docId, wikiDoc => applyWikiDocUpdate(wikiDoc, update), 4);
        data.wiki.documentEvents.publish(docId, { type: 'update', docId, update });
      } catch (error) {
        // this is expected
      }
    };

    const focus = async (docId, selection) => {
      const focus = { connectionId, selection, userId: linkGrant.identity }
      await data.wiki.documentFocus.set(docId, connectionId, focus);
      data.wiki.documentEvents.publish(docId, { type: 'focus', docId, focus });
    }

    const disconnect = async () => {
      for (const [docId, docState] of docStates) {
        closeDoc(docId);
      }
    };

    const handleAction = async (action) => {
      switch (action.type) {
        case 'focus':
          return focus(action.docId, action.focus)
        case 'open':
          return openDoc(action.docId);
        case 'close':
          return closeDoc(action.docId);
        case 'update':
          return update(action.docId, action.version, action.steps, action.clientId);
      }
    }

    return { disconnect, handleAction };
  };


  return {
    connectClient,
    cleanupFocus,
  };
}