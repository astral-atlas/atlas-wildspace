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
  disconnect: () => void,

  handleAction: (action: WikiDocAction) => Promise<void>,
}

export type WikiService = {
  connectClient: (gameId: GameID, connectionId: GameConnectionID, linkGrant: LinkGrant, onWikiEvent: WikiDocEvent => mixed) => WikiServiceClient,
};
*/

import { applyWikiDocUpdate } from "@astral-atlas/wildspace-models";

export const createWikiService = (data/*: WildspaceData*/, connection/*: GameConnectionService*/)/*: WikiService*/ => {
  const connectClient = (gameId, connectionId, linkGrant, onWikiEvent) => {
    const docStates = new Map/*:: <WikiDocID, { unsubscribe: () => mixed }>*/();

    const openDoc = async (docId) => {
      const { result: doc } = await data.wiki.documents.get(gameId, docId);
      if (!doc)
        return;

      if (!docStates.has(doc.id)) {
        const { unsubscribe } = data.wiki.documentEvents.subscribe(doc.id, onWikiEvent)
        docStates.set(doc.id, { unsubscribe });
      }
      const { result: focus } = await data.wiki.documentFocus.query(docId);
      const connections = await connection.getValidConnections(gameId, Date.now());
      onWikiEvent({ type: 'load', focus: focus.filter(f => connections.find(c => c.id === f.connectionId)), doc })
    };
    const closeDoc = async (docId) => {
      const docState = docStates.get(docId);
      if (!docState)
        return;
      docStates.delete(docId);
      docState.unsubscribe();
    };


    const update = async (docId, version, steps, clientId) => {
      const { result: doc } = await data.wiki.documents.get(gameId, docId);
      if (!doc)
        return;
      const update = { version, steps, userId: linkGrant.identity, clientId };
      try {
        const nextDoc = applyWikiDocUpdate(doc, update);
        data.wiki.documentEvents.publish(docId, { type: 'update', docId, update });
        await data.wiki.documents.set(gameId, docId, nextDoc);
      } catch (error) {
        const { result: focus } = await data.wiki.documentFocus.query(docId);
        const connections = await connection.getValidConnections(gameId, Date.now());
        onWikiEvent({ type: 'load', focus: focus.filter(f => connections.find(c => c.id === f.connectionId)), doc })
      }
    };

    const focus = async (docId, selection) => {
      const focus = { connectionId, selection, userId: linkGrant.identity }
      await data.wiki.documentFocus.set(docId, connectionId, focus);
      data.wiki.documentEvents.publish(docId, { type: 'focus', docId, focus });
    }

    const disconnect = () => {
      for (const [docId, docState] of docStates) {
        docState.unsubscribe();
        data.wiki.documentFocus.set(docId, connectionId, null);
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
  };
}