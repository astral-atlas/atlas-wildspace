// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { WikiDoc, WikiDocID, GameID } from "@astral-atlas/wildspace-models";
import type { UserID } from "@astral-atlas/sesame-models";
*/

import { emptyRootNode, proseSchema } from "@astral-atlas/wildspace-models";
import { h, useMemo, useRef, useState } from "@lukekaalim/act";
import { EditorState, PluginKey } from "prosemirror-state";
import { collab, receiveTransaction, sendableSteps, getVersion } from "prosemirror-collab";
import { ProseMirror, prosePlugins, useProseMirrorProps, useProseMirrorView } from "../richText";
import {
  useCollaboratedEditorState,
  useWikiDocConnection,
} from "../richText/collab";
import { useGameConnection } from "./data";
import styles from './Wiki.module.css';
import { Node } from "prosemirror-model";
import { Step } from "prosemirror-transform";
import { createFocusDecorationPlugin } from "../richText";

/*::
export type WikiProps = {
  api: WildspaceClient,
  userId: UserID,
  gameId: GameID,
  docs: $ReadOnlyArray<WikiDoc>,
};
*/

const defaultEditorState = EditorState.create({
  schema: proseSchema,
  doc: emptyRootNode
})

export const Wiki/*: Component<WikiProps>*/ = ({
  api,
  userId,
  gameId,
  docs,
}) => {
  const [, wiki] = useGameConnection(api, gameId);

  const [activeDoc, setActiveDoc] = useState(null)
  const [refreshTime, setRefreshTime] = useState/*:: <number>*/(() => Date.now());

  const [pluginKey] = useState/*:: <PluginKey<any>>*/(() => new PluginKey('focus'))
  const onLoad = (doc) => {
    if (!view || !wikiCon)
      return;
    const plugin = createFocusDecorationPlugin((from, to) => {
      //wikiCon.focus(from, to);
    }, userId, pluginKey);
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
    if (!view)
      return;
    const steps = update.steps.map(s => Step.fromJSON(proseSchema, s));
    const transaction = receiveTransaction(view.state, steps, steps.map(s => update.clientId));
    view.dispatch(transaction);
  };
  const onFocus = (focus) => {
    if (!view || !wikiCon)
      return;
    const tr = view.state.tr;
    tr.setMeta(pluginKey, focus);
    view.dispatch(tr);
  };
  const dispatchTransaction = (transaction) => {
    if (!view || !wikiCon)
      return;
    const nextState = view.state.apply(transaction);
    const sendable = sendableSteps(nextState)
    view.updateState(nextState);
    if (sendable) {
      wikiCon.update(sendable.steps, sendable.clientID, sendable.version);
    }
  }
  const ref = useRef();
  const view = useProseMirrorView(ref, defaultEditorState, [activeDoc]);
  const wikiCon = useWikiDocConnection(wiki, activeDoc, onLoad, onUpdate, onFocus, [view, refreshTime])
  useProseMirrorProps(view, {
    dispatchTransaction,
  }, [view, wikiCon]);

  return h('div', { className: styles.wiki }, [
    h('div', { className: styles.wikiContent }, [
      h('div', { className: styles.wikiControls }, [
        h('select', { onInput: e => setActiveDoc(e.target.value || null) }, [
          docs.map(doc =>
            h('option', { value: doc.id, selected: doc.id === activeDoc }, doc.title)),
          h('option', { value: '', selected: activeDoc === null }, 'None')
        ]),
        h('button', { onClick: () => setRefreshTime(Date.now()) }, 'Reload')
      ]),
      activeDoc && h('div', { ref, className: styles.wikiProseMirrorRoot }),
    ])
  ]);
};