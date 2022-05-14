// @flow strict
/*::
import type { WikiConnection, WikiConnectionClient, WildspaceClient } from '@astral-atlas/wildspace-client2';
import type {
  WikiDoc, WikiDocID,
  WikiDocUpdate, WikiDocFocus, GameConnectionID, WikiDocConnection
} from "@astral-atlas/wildspace-models";
import type { UserID } from "@astral-atlas/sesame-models";

import type { GameData } from "../game/data";
import type { EditorView } from "prosemirror-view";
*/
import { EditorState } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { Step } from 'prosemirror-transform';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { useEffect, useState } from "@lukekaalim/act";
import { proseSchema } from '@astral-atlas/wildspace-models';

import { prosePlugins } from "./ProseMirror";
import { createFocusDecorationPlugin } from './focusDecorationPlugin';

export const useWikiDocConnection = (
  wiki/*: ?WikiConnectionClient*/,
  docId/*: ?WikiDocID*/,
  onConnection/*: WikiConnection => ?(() => mixed)*/,
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    if (!wiki || !docId)
      return;
    const connection = wiki.connect(docId);
    const onConnectionDisconnect = onConnection(connection);
    return () => {
      onConnectionDisconnect && onConnectionDisconnect();
      connection.disconnect();
    }
  }, [docId, wiki, ...deps]);
};

const setupWikiDocCollab = (view, connection, connectionId) => {
  const onSelectionChange = (from, to) => {
    connection.focus(from, to);
  }
  const plugin = createFocusDecorationPlugin(onSelectionChange, connectionId);
  const onLoad = (doc) => {
    view.updateState(EditorState.create({
      schema: proseSchema,
      plugins: [
        ...prosePlugins,
        plugin,
        collab({ version: doc.version })
      ],
      doc: Node.fromJSON(proseSchema, doc.rootNode)
    }))
  };
  const onUpdate = (update) => {
    const steps = update.steps.map(s => Step.fromJSON(proseSchema, s));
    const transaction = receiveTransaction(view.state, steps, steps.map(s => update.clientId));
    view.dispatch(transaction);
  };
  const onFocus = (focus) => {
    const tr = view.state.tr;
    tr.setMeta(plugin, focus);
    view.dispatch(tr);
  };
  const onConnect = (connection) => {
    // TODO
  };
  const rmFocus = connection.addFocusListener(onFocus);
  const rmLoad = connection.addLoadListener(onLoad);
  const rmUpdate = connection.addUpdateListener(onUpdate);
  const rmConnect = connection.addConnectionsListener(onConnect);

  const dispatchTransaction = (transaction) => {
    const nextState = view.state.apply(transaction);
    const sendable = sendableSteps(nextState)
    view.updateState(nextState);
    if (sendable) {
      connection.update(sendable.steps, sendable.clientID, sendable.version);
    }
  }
  view.setProps({ dispatchTransaction });

  return () => {
    rmFocus();
    rmLoad();
    rmConnect();
    rmUpdate();
    connection.disconnect();
  }
}

export const useWikiDocCollab = (
  view/*: ?EditorView*/ = null,
  wiki/*: ?WikiConnectionClient*/ = null,
  connectionId/*: ?GameConnectionID*/ = null,
  docId/*: ?WikiDocID*/ = null,
  deps/*: mixed[]*/ = []
)/*: Map<GameConnectionID, WikiDocConnection>*/ => {
  const [connections, setConnections] = useState(new Map());

  useWikiDocConnection(view && wiki, docId, (connection) => {
    if (!view)
      return;
    const teardown = setupWikiDocCollab(view, connection, connectionId);
    const rmConnections = connection.addConnectionsListener(setConnections)
    return () => {
      rmConnections();
      setConnections(new Map());
      teardown();
    }
  }, [view, ...deps])

  return connections;
}