// @flow strict
/*::
import type { WikiConnection, WikiConnectionClient, WildspaceClient } from '@astral-atlas/wildspace-client2';
import type {
  WikiDoc, WikiDocID,
  WikiDocUpdate, WikiDocFocus
} from "@astral-atlas/wildspace-models";
import type { UserID } from "@astral-atlas/sesame-models";

import type { GameData } from "../game/data";
*/
import { EditorState, Transaction } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { Step } from 'prosemirror-transform';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { useEffect, useMemo, useState } from "@lukekaalim/act";
import { proseSchema } from '@astral-atlas/wildspace-models';

import { prosePlugins } from "./ProseMirror";
import { useGameConnection } from '../game';
import { createFocusDecorationPlugin } from './focusDecorationPlugin';

export const useWikiDocConnection = (
  wiki/*: ?WikiConnectionClient*/,
  docId/*: ?WikiDocID*/,

  onLoad/*: WikiDoc => mixed*/,
  onUpdate/*: WikiDocUpdate => mixed*/,
  onFocus/*: $ReadOnlyArray<WikiDocFocus> => mixed*/,

  deps/*: mixed[]*/ = []
)/*: ?WikiConnection*/ => {
  const [connection, setConnection] = useState/*:: <?WikiConnection>*/();
  
  useEffect(() => {
    if (!wiki || !docId)
      return;
    const connection = wiki.connect(docId, onLoad, onUpdate, onFocus);
    setConnection(connection);
    return () => {
      connection.disconnect();
    }
  }, [docId, wiki, ...deps]);

  return connection;
};

export const useCollaboratedEditorState = (
  wiki/*: ?WikiConnectionClient*/,
  doc/*: ?WikiDocID*/,
  userId/*: UserID*/,
  deps/*: mixed[]*/ = []
)/*: [EditorState<any, any>, Transaction => mixed]*/ => {
  const [connection, setConnection] = useState/*:: <?WikiConnection>*/()
  const [state, setState] = useState/*:: <EditorState<any, any>>*/(
    () => EditorState.create({ schema: proseSchema, plugins: prosePlugins })
  );
  const dispatch = useMemo(() => (transaction) => {
    setState(state => {
      const nextState = state.apply(transaction);

      if (connection) {
        const sendable = sendableSteps(nextState);
        if (sendable)
          connection.update(sendable.steps, sendable.clientID, sendable.version);
      }
      
      return nextState;
    });
  }, [connection]);

  useEffect(() => {
    if (!wiki || !doc)
      return;
      
    const onLoad = (doc) => {
      setState(EditorState.create({
        schema: proseSchema,
        doc: Node.fromJSON(proseSchema, doc.rootNode),
        plugins: [
          ...prosePlugins,
          focusDecoration,
          collab({ version: doc.version })
        ],
      }))
    };
    const onUpdate = (update) => {
      setState(state => {
        const transaction = receiveTransaction(state, update.steps.map(s => Step.fromJSON(proseSchema, s)), update.steps.map(s => update.clientId))
        return state.apply(transaction);
      })
    };
    const onFocus = (focus) => {
      setState(state => {
        const transaction = state.tr;
        transaction.setMeta(focusDecoration, focus);
        return state.apply(transaction)
      })
    }
    const onFocusChange = (from, to) => {
      connection.focus(from, to);
    }
    const connection = wiki.connect(doc, onLoad, onUpdate, onFocus);
    const focusDecoration = createFocusDecorationPlugin(onFocusChange, userId);
    setConnection(connection);
    return () => {
      connection.disconnect();
    }
  }, [wiki, doc, ...deps])

  return [state, dispatch];
}